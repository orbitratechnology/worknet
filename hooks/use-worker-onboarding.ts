import { ExperienceYearsRange, SocialLinks } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const DRAFT_KEY = 'worknet_worker_onboarding_draft';

export interface WorkerOnboardingDraft {
  name: string;
  imageUri: string | null;
  nicNumber: string;
  phoneVerified: boolean;
  phoneNumber: string;
  primaryProfessionId: string;
  primaryProfession: string;
  latitude: number | null;
  longitude: number | null;
  homeCity: string;
  country: string;
  whatsappNumber: string;
  bio: string;
  experienceYears: ExperienceYearsRange;
  baseRate: string;
  pricingType: 'Hourly' | 'Per job';
  workSampleUris: string[];
  socialLinks: SocialLinks;
  emergencyAvailability: boolean;
  languages: string[];
}

export const EMPTY_DRAFT: WorkerOnboardingDraft = {
  name: '',
  imageUri: null,
  nicNumber: '',
  phoneVerified: false,
  phoneNumber: '',
  primaryProfessionId: '',
  primaryProfession: '',
  latitude: null,
  longitude: null,
  homeCity: '',
  country: '',
  whatsappNumber: '',
  bio: '',
  experienceYears: '0-1',
  baseRate: '',
  pricingType: 'Hourly',
  workSampleUris: [],
  socialLinks: {},
  emergencyAvailability: false,
  languages: ['Sinhala'],
};

export function useWorkerOnboarding() {
  const [draft, setDraft] = useState<WorkerOnboardingDraft>(EMPTY_DRAFT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY).then((raw) => {
      if (raw) {
        try {
          setDraft({ ...EMPTY_DRAFT, ...JSON.parse(raw) });
        } catch {
          /* ignore */
        }
      }
      setLoaded(true);
    });
  }, []);

  const updateDraft = useCallback(
    async (patch: Partial<WorkerOnboardingDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const clearDraft = useCallback(async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
    setDraft(EMPTY_DRAFT);
  }, []);

  return { draft, updateDraft, clearDraft, loaded };
}

export function profileCompleteness(draft: WorkerOnboardingDraft): number {
  let score = 0;
  if (draft.name.trim()) score += 15;
  if (draft.imageUri) score += 15;
  if (draft.nicNumber) score += 15;
  if (draft.phoneVerified) score += 15;
  if (draft.primaryProfessionId) score += 15;
  if (draft.latitude && draft.homeCity) score += 15;
  if (draft.bio.trim() || draft.workSampleUris.length) score += 10;
  return score;
}
