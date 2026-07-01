import {
  EMPTY_DRAFT,
  WorkerOnboardingDraft,
} from '@/types/worker-onboarding';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { doc, getDoc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

const LEGACY_DRAFT_IDENTITY_KEYS = [
  'nicNumber',
  'nicLocked',
  'phoneVerified',
  'phoneVerifiedAt',
  'phoneNumber',
] as const;

/** Drop NIC/phone fields persisted before identity moved to user profile. */
export function sanitizeWorkerDraft(
  raw: Partial<WorkerOnboardingDraft> & Record<string, unknown>,
): WorkerOnboardingDraft {
  const next = { ...EMPTY_DRAFT, ...raw };
  for (const key of LEGACY_DRAFT_IDENTITY_KEYS) {
    delete (next as Record<string, unknown>)[key];
  }
  return next;
}

export function serviceProviderToDraft(
  provider: ServiceProvider,
): Partial<WorkerOnboardingDraft> {
  const pricingType =
    provider.pricing?.type === 'Per job' ? 'Per job' : 'Hourly';

  return {
    name: provider.name ?? '',
    imageUri: provider.imageUrl ?? null,
    primaryProfessionId: provider.primaryProfessionId ?? '',
    primaryProfession: provider.primaryProfession ?? '',
    latitude: provider.location?.latitude ?? null,
    longitude: provider.location?.longitude ?? null,
    homeCity: provider.location?.homeCity ?? '',
    country: provider.location?.country ?? 'Sri Lanka',
    whatsappNumber: provider.whatsappNumber ?? '',
    bio: provider.about || provider.bio || '',
    experienceYears: provider.experienceYears ?? '0-1',
    baseRate: provider.pricing?.baseRate?.toString() ?? '',
    pricingType,
    workSampleUris: provider.workSamples ?? [],
    socialLinks: provider.socialLinks ?? {},
    emergencyAvailability: provider.emergencyAvailability ?? false,
    languages:
      provider.languages && provider.languages.length > 0
        ? provider.languages
        : ['Sinhala'],
  };
}

export async function hydrateWorkerDraft(
  uid: string,
  localDraft?: WorkerOnboardingDraft | null,
): Promise<WorkerOnboardingDraft> {
  let draft = sanitizeWorkerDraft(localDraft ?? {});

  try {
    const [userSnap, providerSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid)),
      getDoc(doc(db, 'service_providers', uid)),
    ]);

    const userData = userSnap.data();
    const isServiceProvider = userData?.isServiceProvider === true;

    const stored = userData?.workerOnboarding as
      | Partial<WorkerOnboardingDraft>
      | undefined;
    if (stored) {
      draft = sanitizeWorkerDraft({ ...draft, ...stored });
    }

    if (isServiceProvider && providerSnap.exists()) {
      draft = sanitizeWorkerDraft({
        ...draft,
        ...serviceProviderToDraft({
          ...(providerSnap.data() as ServiceProvider),
          id: providerSnap.id,
        }),
      });
    }
  } catch {
    /* offline or permission — keep local draft */
  }

  return draft;
}

export async function saveWorkerDraftToUser(
  uid: string,
  draft: WorkerOnboardingDraft,
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      workerOnboarding: sanitizeWorkerDraft(draft),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
