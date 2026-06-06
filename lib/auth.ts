import { getAuth } from '@react-native-firebase/auth';

export const auth = getAuth();

if (__DEV__) {
  auth.settings.appVerificationDisabledForTesting = true;
}

export type { FirebaseAuthTypes } from '@react-native-firebase/auth';

