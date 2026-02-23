const admin = require('firebase-admin');
const geofire = require('geofire-common');

// Initialize with your project ID
// NOTE: This requires GOOGLE_APPLICATION_CREDENTIALS to be set if running locally outside of an environment with built-in auth
// For simple seeding, we can often just use the local emulator or a limited service account
// However, since I can't easily set environment variables for external processes, I'll provide a script structure that can be used.

const CATEGORIES = [
  { name: 'Plumbing', slug: 'plumbing', icon: 'water' },
  { name: 'Electrical', slug: 'electrical', icon: 'flash' },
  { name: 'Mason / Construction', slug: 'mason', icon: 'business' },
  { name: 'Carpentry', slug: 'carpentry', icon: 'hammer' },
  { name: 'Cleaning', slug: 'cleaning', icon: 'brush' },
  { name: 'AC & Appliance Repair', slug: 'ac-repair', icon: 'snow' },
  { name: 'Vehicle Repair', slug: 'vehicle-repair', icon: 'car' },
  { name: 'Painting', slug: 'painting', icon: 'color-palette' },
  { name: 'Gardening', slug: 'gardening', icon: 'leaf' },
  { name: 'Tutors', slug: 'tutors', icon: 'book' },
  { name: 'Design & Digital Services', slug: 'digital', icon: 'laptop' },
];

const MOCK_PROVIDERS = [
  {
    name: 'Sunil Perera',
    professions: ['Electrician'],
    categories: ['electrical'],
    rating: 4.8,
    reviewCount: 24,
    experienceYears: 10,
    languages: ['Sinhala', 'English'],
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
      geohash: geofire.geohashForLocation([6.9271, 79.8612]),
      homeCity: 'Colombo 03',
    },
    serviceRadius: 10,
    phoneNumber: '0771234567',
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1540560085022-73042a5f6b2e?w=400&h=400&fit=crop',
  },
  {
    name: 'CleanCo Services',
    professions: ['Cleaning'],
    categories: ['cleaning'],
    rating: 4.5,
    reviewCount: 56,
    experienceYears: 5,
    languages: ['Sinhala', 'Tamil', 'English'],
    location: {
      latitude: 6.9371,
      longitude: 79.8512,
      geohash: geofire.geohashForLocation([6.9371, 79.8512]),
      homeCity: 'Colombo 01',
    },
    serviceRadius: 15,
    phoneNumber: '0712345678',
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6954?w=400&h=400&fit=crop',
  },
];

async function seed() {
  // Use your real config here or service account
  // admin.initializeApp({ ... });
  const db = admin.firestore();

  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await db.collection('categories').doc(cat.slug).set(cat);
  }

  console.log('Seeding mock providers...');
  for (const provider of MOCK_PROVIDERS) {
    await db.collection('service_providers').add({
      ...provider,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seeding complete!');
}

// seed().catch(console.error);
console.log('Seed script created. Run with credentials to seed data.');
