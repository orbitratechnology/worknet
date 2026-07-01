import { ExperienceYearsRange, SocialLinks } from '@/types/database';

export interface WorkerOnboardingDraft {
  name: string;
  imageUri: string | null;
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
