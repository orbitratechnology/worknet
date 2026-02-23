export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoUrl?: string;
  createdAt: any; // Firestore Timestamp
  isServiceProvider: boolean;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  category: string;
  description: string;
  experience: number;
  minPrice: number;
  maxPrice: number;
  portfolioUrls: string[];
  serviceRadius: number;
  isAvailable: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ServiceProvider {
  id: string; // Same as User ID
  name: string;
  title?: string; // e.g. "Professional Plumber"
  bio: string;
  nic?: string;
  professions: string[];
  categories: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  experienceYears: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Professional' | 'Expert';
  languages: string[];
  location: {
    latitude: number;
    longitude: number;
    geohash: string;
    homeCity: string;
    address?: string;
  };
  coverageArea:
    | 'Same city only'
    | 'Nearby cities'
    | 'District-wide'
    | 'Island-wide';
  travelWillingness: boolean;
  travelLimitKm?: number;
  serviceRadius: number; // in km
  phoneNumber: string;
  whatsappNumber?: string;
  contactMethod: 'Call' | 'WhatsApp' | 'In-app';
  imageUrl?: string;
  portfolioUrls?: string[];
  isAvailable: boolean;
  isVerified?: boolean;
  emergencyAvailability: boolean;
  pricing: {
    type: 'Hourly' | 'Daily' | 'Per job' | 'Inspection fee' | 'Free inspection';
    baseRate: number;
    minRate?: number;
    maxRate?: number;
    negotiable: boolean;
  };
  pastProjects?: string;
  clientReferences?: string;
  businessName?: string;
  brn?: string;
  services?: Service[]; // Optional array of specific services
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

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}
