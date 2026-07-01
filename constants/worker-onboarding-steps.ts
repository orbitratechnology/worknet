import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type WorkerOnboardingStep = {
  step: number;
  label: string;
  subtitle: string;
  href: string;
  icon: ComponentProps<typeof Feather>['name'];
};

export const WORKER_ONBOARDING_STEPS: WorkerOnboardingStep[] = [
  {
    step: 1,
    label: 'Welcome',
    subtitle: 'Overview and requirements',
    href: '/(app)/become-worker/',
    icon: 'home',
  },
  {
    step: 2,
    label: 'Identity',
    subtitle: 'Name and profile photo',
    href: '/(app)/become-worker/identity',
    icon: 'user',
  },
  {
    step: 3,
    label: 'Verification',
    subtitle: 'NIC and phone OTP',
    href: '/(app)/become-worker/verification',
    icon: 'shield',
  },
  {
    step: 4,
    label: 'Profession',
    subtitle: 'Primary skill category',
    href: '/(app)/become-worker/profession',
    icon: 'briefcase',
  },
  {
    step: 5,
    label: 'Location',
    subtitle: 'City and map pin',
    href: '/(app)/become-worker/location',
    icon: 'map-pin',
  },
  {
    step: 6,
    label: 'Details',
    subtitle: 'Bio, pricing, work photos',
    href: '/(app)/become-worker/details',
    icon: 'edit-3',
  },
  {
    step: 7,
    label: 'Review',
    subtitle: 'Preview and publish',
    href: '/(app)/become-worker/review',
    icon: 'check-circle',
  },
];
