import { db } from '@/lib/firebase';
import {
  isValidSriLankaNic,
  normalizeSriLankaNic,
} from '@/lib/validation';
import { UserProfile } from '@/types/user';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

export function maskNic(nic: string): string {
  if (nic.length <= 4) return '••••';
  return `${'•'.repeat(Math.max(nic.length - 4, 4))}${nic.slice(-4)}`;
}

export function isIdentityVerified(
  profile: UserProfile | null | undefined,
): boolean {
  return !!(
    profile?.nicVerified &&
    profile?.phoneVerified &&
    profile?.nicNumber &&
    profile?.phoneNumber
  );
}

export function nextStepAfterIdentity(
  profile: UserProfile | null | undefined,
): '/(app)/become-worker/verification' | '/(app)/become-worker/profession' {
  return isIdentityVerified(profile)
    ? '/(app)/become-worker/profession'
    : '/(app)/become-worker/verification';
}

function firestoreErrorMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }
  const code = String((error as { code: string }).code);
  if (code === 'firestore/permission-denied') {
    return 'Could not save your NIC. If you already verified your phone, try again or contact support.';
  }
  return null;
}

async function syncUserNic(uid: string, normalized: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      nicNumber: normalized,
      nicVerified: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

async function waitForNicClaim(
  uid: string,
  normalized: string,
  maxAttempts = 12,
): Promise<'verified' | 'duplicate' | 'pending'> {
  for (let i = 0; i < maxAttempts; i += 1) {
    const [userSnap, verificationSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid)),
      getDoc(doc(db, 'provider_verification', uid)),
    ]);

    const userData = userSnap.data();
    const verificationNic = verificationSnap.data()?.nicNumber as
      | string
      | undefined;

    if (userData?.nicVerified && userData?.nicNumber === normalized) {
      return 'verified';
    }

    if (!verificationNic) {
      return 'duplicate';
    }

    if (verificationNic !== normalized) {
      return 'duplicate';
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return 'pending';
}

/** Finish NIC verification when provider_verification already has a saved NIC. */
export async function repairPendingNicVerification(uid: string): Promise<boolean> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.data()?.nicVerified) {
    return true;
  }

  const verificationSnap = await getDoc(doc(db, 'provider_verification', uid));
  const verificationNic = verificationSnap.data()?.nicNumber as string | undefined;
  if (!verificationNic || !isValidSriLankaNic(verificationNic)) {
    return false;
  }

  const normalized = normalizeSriLankaNic(verificationNic);
  await syncUserNic(uid, normalized);
  const result = await waitForNicClaim(uid, normalized);
  return result === 'verified';
}

export async function claimNic(uid: string, rawNic: string): Promise<void> {
  const normalized = normalizeSriLankaNic(rawNic.trim());
  if (!normalized) {
    throw new Error('Enter your NIC number to continue.');
  }
  if (!isValidSriLankaNic(normalized)) {
    throw new Error(
      'Enter a valid NIC: 9 digits + V (e.g. 123456789V) or 12 digits.',
    );
  }

  const [userSnap, verificationSnap] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDoc(doc(db, 'provider_verification', uid)),
  ]);

  const userData = userSnap.data();
  if (userData?.nicVerified) {
    if (userData.nicNumber === normalized) {
      return;
    }
    throw new Error('Your NIC is already verified and cannot be changed.');
  }

  const existingNic = verificationSnap.data()?.nicNumber as string | undefined;
  if (existingNic) {
    const existingNormalized = normalizeSriLankaNic(existingNic);
    if (existingNormalized === normalized) {
      await syncUserNic(uid, normalized);
      const result = await waitForNicClaim(uid, normalized);
      if (result === 'verified') return;
      if (result === 'duplicate') {
        throw new Error(
          'This NIC is already linked to another account. Each NIC can only be used once.',
        );
      }
      throw new Error('NIC verification is still processing. Try again in a moment.');
    }
    throw new Error('Your NIC is already saved and cannot be changed.');
  }

  try {
    await setDoc(
      doc(db, 'provider_verification', uid),
      {
        nicNumber: normalized,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error: unknown) {
    throw new Error(
      firestoreErrorMessage(error) ??
        'Could not save your NIC. Please try again.',
    );
  }

  await syncUserNic(uid, normalized);

  const result = await waitForNicClaim(uid, normalized);
  if (result === 'verified') {
    return;
  }
  if (result === 'duplicate') {
    throw new Error(
      'This NIC is already linked to another account. Each NIC can only be used once.',
    );
  }

  const userAfter = await getDoc(doc(db, 'users', uid));
  if (userAfter.data()?.nicVerified) {
    return;
  }

  throw new Error('NIC verification is still processing. Try again in a moment.');
}

export async function savePhoneVerification(
  uid: string,
  phone: string,
): Promise<void> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.data()?.phoneVerified) {
    throw new Error('Your phone number is already verified and cannot be changed.');
  }

  await setDoc(
    doc(db, 'users', uid),
    {
      phoneNumber: phone,
      phoneVerified: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const verificationRef = doc(db, 'provider_verification', uid);
  const verificationSnap = await getDoc(verificationRef);
  if (verificationSnap.exists()) {
    await setDoc(
      verificationRef,
      {
        phoneNumber: phone,
        phoneVerified: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}
