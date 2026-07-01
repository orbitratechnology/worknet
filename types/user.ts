import type { WorkerOnboardingDraft } from '@/types/worker-onboarding';

export type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  bio?: string;
  createdAt?: any;
  phoneNumber?: string;
  phoneVerified?: boolean;
  nicNumber?: string;
  nicVerified?: boolean;
  photoUrl?: string;
  isServiceProvider?: boolean;
  workerOnboarding?: Partial<WorkerOnboardingDraft>;
};
