import { useAuth } from '@/context/auth';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { SavedProvidersDoc } from '@/types/database';
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export function useSavedProviders() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSavedIds([]);
      setLoading(false);
      return;
    }

    const ref = doc(db, 'saved_providers', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap?.exists()) {
          setSavedIds([]);
          setLoading(false);
          return;
        }
        const data = snap.data() as SavedProvidersDoc | undefined;
        setSavedIds(data?.providerIds ?? []);
        setLoading(false);
      },
      (error) => {
        logger.warn('Saved providers listener error', error);
        setSavedIds([]);
        setLoading(false);
      },
    );

    return unsub;
  }, [user?.uid]);

  const isSaved = useCallback(
    (providerId: string) => savedIds.includes(providerId),
    [savedIds],
  );

  const toggleSave = useCallback(
    async (providerId: string) => {
      if (!user?.uid) return false;

      const ref = doc(db, 'saved_providers', user.uid);
      const saved = savedIds.includes(providerId);

      await setDoc(
        ref,
        {
          providerIds: saved
            ? arrayRemove(providerId)
            : arrayUnion(providerId),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      return !saved;
    },
    [user?.uid, savedIds],
  );

  return { savedIds, loading, isSaved, toggleSave };
}
