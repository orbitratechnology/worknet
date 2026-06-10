import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { UserProfile } from '@/types/user';
import {
  AppleSignInCancelledError,
  signInWithAppleCredential,
} from '@/lib/apple-auth';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  reload,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { GoogleAuth } from 'react-native-google-auth';
import { Toast } from 'toastify-react-native';

type User = FirebaseAuthTypes.User;

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithApple: () => Promise<any>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleAuth.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        logger.error('Error fetching user profile', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const recordSession = async (currUser: User) => {
    try {
      const sessionId =
        (await SecureStore.getItemAsync('session_id')) || Crypto.randomUUID();
      await SecureStore.setItemAsync('session_id', sessionId);

      const sessionRef = doc(db, 'users', currUser.uid, 'sessions', sessionId);
      await setDoc(
        sessionRef,
        {
          sessionId,
          deviceName: Constants.deviceName || 'Unknown Device',
          platform: Platform.OS,
          modelName: Constants.expoConfig?.name || 'App',
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (err) {
      logger.error('Failed to record session', err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      signIn: async (email: string, password: string) => {
        const cred = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        await recordSession(cred.user);
        return cred;
      },
      signUp: async (email: string, password: string, fullName: string) => {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        try {
          const sanitizedName = fullName
            .trim()
            .replace(/<[^>]*>/g, '')
            .slice(0, 100);
          await updateProfile(cred.user, { displayName: sanitizedName });
        } catch (err) {
          logger.error('Failed to update auth profile', err);
        }

        try {
          await setDoc(
            doc(db, 'users', cred.user.uid),
            {
              id: cred.user.uid,
              name: fullName,
              email: email.trim(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (err) {
          logger.error('Failed to create user document', err);
        }

        await recordSession(cred.user);

        try {
          await sendEmailVerification(cred.user);
        } catch (err) {
          logger.warn('Failed to send verification email', err);
          Toast.warn(
            'Account created, but verification email could not be sent.',
          );
        }
        return cred;
      },
      signInWithGoogle: async () => {
        try {
          const response = await GoogleAuth.signIn();
          if (response.type === 'success') {
            const credential = GoogleAuthProvider.credential(
              response.data.idToken,
            );
            const cred = await signInWithCredential(auth, credential);

            try {
              await setDoc(
                doc(db, 'users', cred.user.uid),
                {
                  id: cred.user.uid,
                  name: cred.user.displayName || 'User',
                  email: cred.user.email,
                  photoUrl: cred.user.photoURL,
                  updatedAt: serverTimestamp(),
                },
                { merge: true },
              );
            } catch (err) {
              logger.error('Failed to sync google profile to firestore', err);
            }

            await recordSession(cred.user);
            return cred;
          }
          if (response.type === 'cancelled') {
            throw new Error('Sign-in cancelled');
          }
          throw new Error('Google Sign-In failed');
        } catch (error) {
          logger.error('Google Sign-In Error:', error);
          throw error;
        }
      },
      signInWithApple: async () => {
        try {
          const { userCredential, displayName } =
            await signInWithAppleCredential();

          try {
            await setDoc(
              doc(db, 'users', userCredential.user.uid),
              {
                id: userCredential.user.uid,
                name:
                  displayName ||
                  userCredential.user.displayName ||
                  'User',
                email: userCredential.user.email,
                photoUrl: userCredential.user.photoURL,
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
          } catch (err) {
            logger.error('Failed to sync apple profile to firestore', err);
          }

          if (displayName && !userCredential.user.displayName) {
            try {
              await updateProfile(userCredential.user, {
                displayName,
              });
            } catch (err) {
              logger.error('Failed to update apple display name', err);
            }
          }

          await recordSession(userCredential.user);
          return userCredential;
        } catch (error) {
          if (error instanceof AppleSignInCancelledError) {
            throw error;
          }
          logger.error('Apple Sign-In Error:', error);
          throw error;
        }
      },
      signOut: async () => {
        try {
          await GoogleAuth.signOut().catch(() => {});
          await firebaseSignOut(auth);
          await SecureStore.deleteItemAsync('session_id');
          setUserProfile(null);
        } catch (error) {
          logger.error('Sign out error', error);
        }
      },
      sendPasswordResetEmail: async (email: string) => {
        await sendPasswordResetEmail(auth, email.trim());
      },
      updateUserProfile: async (data: Partial<UserProfile>) => {
        if (!user) throw new Error('No authenticated user');
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        if (data.name || data.photoUrl) {
          await updateProfile(user, {
            displayName: data.name || user.displayName,
            photoURL: data.photoUrl || user.photoURL,
          });
        }
      },
      sendVerificationEmail: async () => {
        if (!auth.currentUser) return;
        await sendEmailVerification(auth.currentUser);
      },
      refreshUser: async () => {
        if (!auth.currentUser) {
          setUser(null);
          return;
        }
        await reload(auth.currentUser);
        setUser(auth.currentUser);
      },
    }),
    [user, userProfile, loading],
  );

  return (
    <AuthContext.Provider value={value as any}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
