import { auth } from '@/lib/auth';
import { reauthenticateWithApple } from '@/lib/apple-auth';
import { db, storage } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { normalizeSriLankaNic } from '@/lib/validation';
import {
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from '@react-native-firebase/firestore';
import { deleteObject, listAll, ref } from '@react-native-firebase/storage';
import { GoogleAuth } from 'react-native-google-auth';

async function deleteStorageFolder(prefix: string) {
  try {
    const folderRef = ref(storage, prefix);
    const listing = await listAll(folderRef);
    await Promise.all(listing.items.map((item) => deleteObject(item)));
    await Promise.all(
      listing.prefixes.map(async (sub) => deleteStorageFolder(sub.fullPath)),
    );
  } catch (error) {
    logger.warn(`Storage cleanup skipped for ${prefix}`, error);
  }
}

async function deleteUserSessions(uid: string) {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const snap = await getDocs(sessionsRef);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((sessionDoc) => batch.delete(sessionDoc.ref));
  await batch.commit();
}

async function cleanupUserData(uid: string) {
  let nicRegistryDoc: string | null = null;
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    const nic = userSnap.data()?.nicNumber as string | undefined;
    if (nic) {
      nicRegistryDoc = normalizeSriLankaNic(nic);
    }
  } catch {
    /* ignore */
  }

  await Promise.all([
    deleteDoc(doc(db, 'users', uid)).catch((e) =>
      logger.warn('User doc delete failed', e),
    ),
    deleteDoc(doc(db, 'service_providers', uid)).catch(() => {}),
    deleteDoc(doc(db, 'provider_verification', uid)).catch(() => {}),
    deleteDoc(doc(db, 'saved_providers', uid)).catch(() => {}),
    nicRegistryDoc
      ? deleteDoc(doc(db, 'nic_registry', nicRegistryDoc)).catch(() => {})
      : Promise.resolve(),
    deleteUserSessions(uid).catch((e) =>
      logger.warn('Session cleanup failed', e),
    ),
    deleteStorageFolder(`profile_photos/${uid}`),
    deleteStorageFolder(`work_samples/${uid}`),
    deleteStorageFolder(`portfolio_images/${uid}`),
  ]);
}

async function reauthenticateUser(
  user: FirebaseAuthTypes.User,
  password?: string,
) {
  const providers = user.providerData.map((p) => p.providerId);
  const primary = providers[0];

  if (primary === 'apple.com') {
    await reauthenticateWithApple(user);
    return;
  }

  if (primary === 'password') {
    if (!password?.trim()) {
      throw Object.assign(new Error('Password required'), {
        code: 'auth/requires-recent-login',
      });
    }
    if (!user.email) {
      throw new Error('Missing email for re-authentication.');
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return;
  }

  if (primary === 'google.com') {
    const response = await GoogleAuth.signIn();
    if (response.type !== 'success') {
      throw new Error('Sign-in cancelled');
    }
    const credential = GoogleAuthProvider.credential(response.data.idToken);
    await reauthenticateWithCredential(user, credential);
    return;
  }

  throw Object.assign(new Error('Re-authentication required'), {
    code: 'auth/requires-recent-login',
  });
}

export async function deleteUserAccount(password?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const uid = user.uid;

  const runDeletion = async () => {
    await cleanupUserData(uid);
    await deleteUser(user);
  };

  try {
    await runDeletion();
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: string }).code)
        : '';
    if (code !== 'auth/requires-recent-login') {
      throw error;
    }
    await reauthenticateUser(user, password);
    await runDeletion();
  }
}
