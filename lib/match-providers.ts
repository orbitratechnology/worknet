import { PROBLEMS } from '@/constants/problems';
import { WORKER_TYPES } from '@/constants/worker-types';
import { ExperienceYearsRange, ServiceProvider } from '@/types/database';
import { calculateDistance } from '@/lib/geo';

export type MatchSortMode =
  | 'best'
  | 'nearest'
  | 'topRated'
  | 'available'
  | 'newest';

export interface MatchContext {
  coords?: { latitude: number; longitude: number } | null;
  problemSlug?: string | null;
  professionId?: string | null;
  searchText?: string;
  onlyAvailable?: boolean;
  emergencyOnly?: boolean;
  minRating?: number;
  maxDistanceKm?: number;
  sortMode?: MatchSortMode;
}

function createdAtMs(createdAt: unknown): number {
  if (!createdAt) return 0;
  const ts = createdAt as { toMillis?: () => number; seconds?: number };
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  return 0;
}

export interface MatchedProvider extends ServiceProvider {
  distance?: number;
  score: number;
  matchReason: string;
}

const EXPERIENCE_SCORE: Record<ExperienceYearsRange, number> = {
  '0-1': 1,
  '1-3': 2,
  '3-5': 3,
  '5-10': 4,
  '10+': 5,
};

function getProblemWorkerTypeIds(slug: string | null | undefined): string[] {
  if (!slug) return [];
  const problem = PROBLEMS.find((p) => p.slug === slug);
  return problem?.workerTypes ?? [];
}

function professionMatchScore(
  provider: ServiceProvider,
  context: MatchContext,
): number {
  const problemIds = getProblemWorkerTypeIds(context.problemSlug);
  if (problemIds.length > 0) {
    if (problemIds.includes(provider.primaryProfessionId)) return 40;
    if (
      provider.secondaryProfessions?.some((p) =>
        problemIds.includes(
          WORKER_TYPES.find((w) => w.name === p)?.id ?? '',
        ),
      )
    ) {
      return 30;
    }
    if (context.problemSlug && provider.tags?.includes(context.problemSlug)) {
      return 20;
    }
    return 0;
  }

  if (context.professionId) {
    if (provider.primaryProfessionId === context.professionId) return 40;
    const profName = WORKER_TYPES.find((w) => w.id === context.professionId)?.name;
    if (profName && provider.secondaryProfessions?.includes(profName)) return 25;
    return 0;
  }

  return 20;
}

function distanceScore(km: number | undefined, maxKm: number): number {
  if (km === undefined) return 8;
  if (km <= 0) return 25;
  if (km >= maxKm) return 0;
  return Math.round(25 * (1 - km / maxKm));
}

function profileCompletenessScore(provider: ServiceProvider): number {
  let score = 0;
  if (provider.imageUrl) score += 1;
  if (provider.bio?.trim()) score += 1;
  if (provider.workSamples?.length) score += 1;
  if (provider.pricing?.baseRate) score += 1;
  if (provider.phoneVerified) score += 1;
  return score;
}

function buildMatchReason(
  provider: ServiceProvider,
  distance?: number,
): string {
  const parts: string[] = [provider.primaryProfession || 'Worker'];
  if (distance !== undefined) {
    parts.push(distance < 1 ? 'Under 1 km' : `${distance.toFixed(1)} km`);
  }
  if (provider.availabilityStatus === 'online') {
    parts.push('Available');
  }
  return parts.join(' · ');
}

export function scoreProvider(
  provider: ServiceProvider,
  context: MatchContext,
  distance?: number,
): number {
  const maxKm = context.maxDistanceKm ?? 50;
  let score = professionMatchScore(provider, context);
  score += distanceScore(distance, maxKm);
  if (provider.availabilityStatus === 'online') score += 15;
  score += Math.round(((provider.rating ?? 0) / 5) * 10);
  const reviews = provider.reviewCount ?? 0;
  score += Math.min(5, Math.round(Math.log10(reviews + 1) * 3));
  score += profileCompletenessScore(provider);
  return score;
}

export function filterProviders(
  providers: ServiceProvider[],
  context: MatchContext,
): ServiceProvider[] {
  const problemIds = getProblemWorkerTypeIds(context.problemSlug);
  const query = context.searchText?.toLowerCase().trim() ?? '';

  return providers.filter((provider) => {
    if (context.onlyAvailable && provider.availabilityStatus !== 'online') {
      return false;
    }

    if (context.minRating && (provider.rating ?? 0) < context.minRating) {
      return false;
    }

    if (context.emergencyOnly && !provider.emergencyAvailability) {
      return false;
    }

    if (problemIds.length > 0) {
      const matchesProfession =
        problemIds.includes(provider.primaryProfessionId) ||
        provider.tags?.includes(context.problemSlug ?? '') ||
        provider.secondaryProfessions?.some((name) => {
          const id = WORKER_TYPES.find((w) => w.name === name)?.id;
          return id && problemIds.includes(id);
        });
      if (!matchesProfession) return false;
    }

    if (context.professionId && !context.problemSlug) {
      const matches =
        provider.primaryProfessionId === context.professionId ||
        provider.primaryProfession ===
          WORKER_TYPES.find((w) => w.id === context.professionId)?.name;
      if (!matches) return false;
    }

    if (query) {
      const haystack = [
        provider.name,
        provider.title,
        provider.primaryProfession,
        provider.bio,
        ...(provider.tags ?? []),
        ...(provider.secondaryProfessions ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export function matchProviders(
  providers: (ServiceProvider & { distance?: number })[],
  context: MatchContext,
): MatchedProvider[] {
  const maxKm = context.maxDistanceKm ?? 50;
  const filtered = filterProviders(providers, context);

  const scored = filtered
    .map((provider) => {
      const withDistance = provider as ServiceProvider & { distance?: number };
      let distance = withDistance.distance;
      if (
        distance === undefined &&
        context.coords &&
        provider.location?.latitude &&
        provider.location?.longitude
      ) {
        distance = calculateDistance(
          context.coords.latitude,
          context.coords.longitude,
          provider.location.latitude,
          provider.location.longitude,
        );
      }

      if (distance !== undefined && distance > maxKm) {
        return null;
      }

      return {
        ...provider,
        distance,
        score: scoreProvider(provider, context, distance),
        matchReason: buildMatchReason(provider, distance),
      };
    })
    .filter((item) => item !== null) as MatchedProvider[];

  const sortMode = context.sortMode ?? 'best';

  scored.sort((a, b) => {
    if (sortMode === 'nearest') {
      return (a.distance ?? 999) - (b.distance ?? 999);
    }
    if (sortMode === 'topRated') {
      return (b.rating ?? 0) - (a.rating ?? 0) || b.score - a.score;
    }
    if (sortMode === 'available') {
      const aOnline = a.availabilityStatus === 'online' ? 1 : 0;
      const bOnline = b.availabilityStatus === 'online' ? 1 : 0;
      return bOnline - aOnline || b.score - a.score;
    }
    if (sortMode === 'newest') {
      return (
        createdAtMs(b.createdAt) - createdAtMs(a.createdAt) ||
        b.score - a.score
      );
    }
    return b.score - a.score || (a.distance ?? 999) - (b.distance ?? 999);
  });

  return scored;
}

export function getTagsForProfession(professionId: string): string[] {
  return PROBLEMS.filter((p) => p.workerTypes.includes(professionId)).map(
    (p) => p.slug,
  );
}

export function sortModeFromChip(chip: string): MatchSortMode {
  switch (chip) {
    case 'Nearest':
      return 'nearest';
    case 'Top Rated':
      return 'topRated';
    case 'Available Now':
      return 'available';
    default:
      return 'best';
  }
}
