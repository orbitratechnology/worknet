export type ExperienceYearsRange =
  | '0-1'
  | '1-3'
  | '3-5'
  | '5-10'
  | '10+';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  photoUrl?: string;
  bio?: string;
  createdAt: any;
  isServiceProvider: boolean;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  experience: number;
  minPrice: number;
  maxPrice: number;
  workSamples: string[];
  isAvailable: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ServiceProvider {
  id: string;
  name: string;
  title?: string;
  bio: string;
  about?: string;
  nicNumber?: string;
  nicVerified?: boolean;
  phoneVerified?: boolean;
  primaryProfessionId: string;
  primaryProfession: string;
  secondaryProfessions: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  experienceYears: ExperienceYearsRange;
  languages: string[];
  location: {
    latitude: number;
    longitude: number;
    geohash: string;
    homeCity: string;
    country: string;
    address?: string;
  };
  phoneNumber: string;
  whatsappNumber?: string;
  contactMethod: 'Call' | 'WhatsApp' | 'In-app';
  imageUrl?: string;
  workSamples?: string[];
  availabilityStatus?: 'online' | 'offline';
  emergencyAvailability: boolean;
  socialLinks?: SocialLinks;
  pricing: {
    type: 'Hourly' | 'Daily' | 'Per job' | 'Inspection fee' | 'Free inspection';
    baseRate: number;
    minRate?: number;
    maxRate?: number;
    negotiable: boolean;
  };
  businessName?: string;
  services?: Service[];
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  providerId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

export interface SavedProvidersDoc {
  providerIds: string[];
  updatedAt: any;
}
