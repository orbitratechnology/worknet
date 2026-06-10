/**
 * Native Firebase phone verification for worker onboarding.
 * Links the verified phone to the signed-in account (requires a dev build).
 */
import { auth } from '@/lib/auth';
import { normalizePhoneE164 } from '@/lib/validation';

export type PhoneConfirmation = {
  confirm: (code: string) => Promise<void>;
};

export async function sendPhoneOtp(phone: string): Promise<PhoneConfirmation> {
  const normalized = normalizePhoneE164(phone);

  if (!auth.currentUser) {
    throw new Error('You must be signed in before verifying your phone.');
  }

  let verificationId: string;
  try {
    const { verifyPhoneNumber } = await import('@react-native-firebase/auth');
    const verification = await verifyPhoneNumber(auth, normalized, 60);
    verificationId = verification.verificationId;
  } catch {
    throw new Error(
      'Phone verification requires a development build with @react-native-firebase/auth.',
    );
  }

  return {
    confirm: async (code: string) => {
      const { PhoneAuthProvider, linkWithCredential } = await import(
        '@react-native-firebase/auth'
      );
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be signed in before verifying your phone.');
      }
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(currentUser, credential);
    },
  };
}

/** @deprecated Use sendPhoneOtp */
export const sendPhoneOtpLegacy = sendPhoneOtp;
