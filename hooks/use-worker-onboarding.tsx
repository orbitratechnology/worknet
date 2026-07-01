import {
  hydrateWorkerDraft,
  sanitizeWorkerDraft,
  saveWorkerDraftToUser,
} from '@/lib/worker-draft-sync';
import { useAuth } from '@/context/auth';
import {
  EMPTY_DRAFT,
  WorkerOnboardingDraft,
} from '@/types/worker-onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const LEGACY_DRAFT_KEY = 'worknet_worker_onboarding_draft';

function draftStorageKey(uid: string | undefined): string | null {
  if (!uid) return null;
  return `worknet_worker_onboarding_draft_${uid}`;
}

export type { WorkerOnboardingDraft } from '@/types/worker-onboarding';
export { EMPTY_DRAFT } from '@/types/worker-onboarding';

type WorkerOnboardingContextValue = {
  draft: WorkerOnboardingDraft;
  updateDraft: (patch: Partial<WorkerOnboardingDraft>) => Promise<void>;
  clearDraft: () => Promise<void>;
  loaded: boolean;
};

const WorkerOnboardingContext = createContext<
  WorkerOnboardingContextValue | undefined
>(undefined);

export function WorkerOnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<WorkerOnboardingDraft>(EMPTY_DRAFT);
  const [loaded, setLoaded] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    (async () => {
      if (!user?.uid) {
        if (!cancelled) {
          setDraft(EMPTY_DRAFT);
          setLoaded(true);
        }
        return;
      }

      const storageKey = draftStorageKey(user.uid)!;
      let local: WorkerOnboardingDraft | null = null;
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) {
        try {
          local = sanitizeWorkerDraft({ ...EMPTY_DRAFT, ...JSON.parse(raw) });
        } catch {
          /* ignore */
        }
      } else {
        const legacyRaw = await AsyncStorage.getItem(LEGACY_DRAFT_KEY);
        if (legacyRaw) {
          try {
            local = sanitizeWorkerDraft({ ...EMPTY_DRAFT, ...JSON.parse(legacyRaw) });
          } catch {
            /* ignore */
          }
          await AsyncStorage.removeItem(LEGACY_DRAFT_KEY);
        }
      }

      let next = local ?? { ...EMPTY_DRAFT };
      next = await hydrateWorkerDraft(user.uid, next);

      if (!cancelled) {
        setDraft(next);
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const persistDraft = useCallback(
    (next: WorkerOnboardingDraft) => {
      const storageKey = draftStorageKey(user?.uid);
      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(next));
      }
      if (!user?.uid) return;
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        saveWorkerDraftToUser(user.uid, next).catch(() => {});
      }, 400);
    },
    [user?.uid],
  );

  const updateDraft = useCallback(
    async (patch: Partial<WorkerOnboardingDraft>) => {
      setDraft((prev) => {
        const next = sanitizeWorkerDraft({ ...prev, ...patch });
        persistDraft(next);
        return next;
      });
    },
    [persistDraft],
  );

  const clearDraft = useCallback(async () => {
    const storageKey = draftStorageKey(user?.uid);
    if (storageKey) {
      await AsyncStorage.removeItem(storageKey);
    }
    setDraft(EMPTY_DRAFT);
    if (user?.uid) {
      await saveWorkerDraftToUser(user.uid, EMPTY_DRAFT).catch(() => {});
    }
  }, [user?.uid]);

  const value = useMemo(
    () => ({ draft, updateDraft, clearDraft, loaded }),
    [draft, updateDraft, clearDraft, loaded],
  );

  return React.createElement(
    WorkerOnboardingContext.Provider,
    { value },
    children,
  );
}

export function useWorkerOnboarding() {
  const context = useContext(WorkerOnboardingContext);
  if (!context) {
    throw new Error(
      'useWorkerOnboarding must be used within WorkerOnboardingProvider',
    );
  }
  return context;
}

import { UserProfile } from '@/types/user';

export function profileCompleteness(
  draft: WorkerOnboardingDraft,
  identity?: Pick<UserProfile, 'nicVerified' | 'phoneVerified'>,
): number {
  let score = 0;
  if (draft.name.trim()) score += 15;
  if (draft.imageUri) score += 15;
  if (identity?.nicVerified) score += 15;
  if (identity?.phoneVerified) score += 15;
  if (draft.primaryProfessionId) score += 15;
  if (draft.latitude && draft.homeCity) score += 15;
  if (draft.bio.trim() || draft.workSampleUris.length) score += 10;
  return score;
}

/** Sync local form state when the shared draft loads (once per load cycle). */
export function useSyncDraftField<K extends keyof WorkerOnboardingDraft>(
  key: K,
): [WorkerOnboardingDraft[K], (value: WorkerOnboardingDraft[K]) => void] {
  const { draft, updateDraft, loaded } = useWorkerOnboarding();
  const [value, setValue] = useState(draft[key]);
  const syncedFromDraft = useRef(false);

  useEffect(() => {
    if (!loaded) {
      syncedFromDraft.current = false;
      return;
    }
    if (syncedFromDraft.current) return;
    setValue(draft[key]);
    syncedFromDraft.current = true;
  }, [loaded, draft[key], key]);

  const set = useCallback(
    (next: WorkerOnboardingDraft[K]) => {
      setValue(next);
      updateDraft({ [key]: next } as Partial<WorkerOnboardingDraft>);
    },
    [key, updateDraft],
  );

  return [value, set];
}
