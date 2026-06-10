import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  AppleAuthProvider,
  reauthenticateWithCredential,
  revokeAccessToken,
  signInWithCredential,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

export class AppleSignInCancelledError extends Error {
  constructor() {
    super('Sign-in cancelled');
    this.name = 'AppleSignInCancelledError';
  }
}

async function createAppleCredential() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error('Apple Sign-In did not return an identity token.');
  }

  const firebaseCredential = AppleAuthProvider.credential(
    appleCredential.identityToken,
    rawNonce,
  );

  return { appleCredential, firebaseCredential };
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signInWithAppleCredential(): Promise<{
  userCredential: FirebaseAuthTypes.UserCredential;
  displayName: string | null;
}> {
  try {
    const { appleCredential, firebaseCredential } =
      await createAppleCredential();
    const userCredential = await signInWithCredential(auth, firebaseCredential);

    const fullName = appleCredential.fullName;
    const displayName = fullName
      ? AppleAuthentication.formatFullName(fullName)
      : null;

    return { userCredential, displayName };
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: string }).code)
        : '';
    if (code === 'ERR_REQUEST_CANCELED') {
      throw new AppleSignInCancelledError();
    }
    logger.error('Apple Sign-In failed', error);
    throw error;
  }
}

export async function reauthenticateWithApple(
  user: FirebaseAuthTypes.User,
): Promise<void> {
  const { appleCredential, firebaseCredential } = await createAppleCredential();
  await reauthenticateWithCredential(user, firebaseCredential);

  if (appleCredential.authorizationCode) {
    try {
      await revokeAccessToken(auth, appleCredential.authorizationCode);
    } catch (error) {
      logger.warn('Apple token revocation failed during re-auth', error);
    }
  }
}
