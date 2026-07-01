import { getTagsForProfession } from '@/lib/match-providers';
import { db } from '@/lib/firebase';
import { getGeohash } from '@/lib/geo';
import {
  profilePhotoPath,
  resolveImageUrl,
  workSamplePath,
} from '@/lib/storage';
import { WorkerOnboardingDraft } from '@/types/worker-onboarding';
import { saveWorkerDraftToUser } from '@/lib/worker-draft-sync';
import { UserProfile } from '@/types/user';
import { isIdentityVerified } from '@/lib/user-identity';
import { ServiceProvider } from '@/types/database';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  doc,
  deleteField,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

export async function publishWorkerProfile(
  user: FirebaseAuthTypes.User,
  draft: WorkerOnboardingDraft,
  existingCreatedAt?: any,
): Promise<void> {
  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const userData = userSnap.data();

  if (!isIdentityVerified(userData as UserProfile)) {
    throw new Error(
      'Complete NIC and phone verification before publishing your worker profile.',
    );
  }

  const phoneNumber = userData!.phoneNumber as string;

  const imageUrl = draft.imageUri
    ? await resolveImageUrl(draft.imageUri, profilePhotoPath(user.uid))
    : '';

  const workSamples = await Promise.all(
    draft.workSampleUris.map((uri, i) =>
      resolveImageUrl(uri, workSamplePath(user.uid, i)),
    ),
  );

  const geohash =
    draft.latitude && draft.longitude
      ? getGeohash(draft.latitude, draft.longitude)
      : '';

  const provider: Partial<ServiceProvider> = {
    id: user.uid,
    name: draft.name.trim(),
    bio: draft.bio.trim() || draft.primaryProfession,
    about: draft.bio.trim(),
    nicVerified: true,
    phoneVerified: true,
    primaryProfessionId: draft.primaryProfessionId,
    primaryProfession: draft.primaryProfession,
    secondaryProfessions: [],
    tags: getTagsForProfession(draft.primaryProfessionId),
    rating: 0,
    reviewCount: 0,
    experienceYears: draft.experienceYears,
    languages:
      draft.languages.length > 0 ? draft.languages : ['Sinhala'],
    location: {
      latitude: draft.latitude ?? 0,
      longitude: draft.longitude ?? 0,
      geohash,
      homeCity: draft.homeCity,
      country: draft.country || 'Sri Lanka',
    },
    phoneNumber,
    whatsappNumber: draft.whatsappNumber.trim() || phoneNumber,
    contactMethod: draft.whatsappNumber ? 'WhatsApp' : 'Call',
    imageUrl,
    workSamples,
    availabilityStatus: 'online',
    emergencyAvailability: draft.emergencyAvailability,
    socialLinks: draft.socialLinks,
    pricing: {
      type: draft.pricingType,
      baseRate: parseInt(draft.baseRate, 10) || 0,
      negotiable: true,
    },
    updatedAt: serverTimestamp(),
  };

  if (!existingCreatedAt) {
    provider.createdAt = serverTimestamp();
  }

  await setDoc(
    doc(db, 'service_providers', user.uid),
    {
      ...provider,
      nicNumber: deleteField(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, 'provider_verification', user.uid),
    {
      phoneVerified: true,
      phoneNumber,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, 'users', user.uid),
    {
      isServiceProvider: true,
      name: draft.name.trim(),
      photoUrl: imageUrl,
      workerOnboarding: draft,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await saveWorkerDraftToUser(user.uid, draft);
}
