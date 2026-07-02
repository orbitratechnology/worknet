import {
  MatchContext,
  matchProviders,
  MatchSortMode,
  sortModeFromChip,
} from '@/lib/match-providers';
import { getNearbyProviders } from '@/lib/geo';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  where,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

interface UseMatchedProvidersOptions extends MatchContext {
  fetchLimit?: number;
}

export { sortModeFromChip, type MatchSortMode };

export function useMatchedProviders(options: UseMatchedProvidersOptions) {
  const [providers, setProviders] = useState<
    ReturnType<typeof matchProviders>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let raw: (ServiceProvider & { distance?: number })[] = [];

      if (options.coords) {
        raw = await getNearbyProviders(
          options.coords.latitude,
          options.coords.longitude,
          options.maxDistanceKm ?? 50,
        );
      } else {
        const constraints: QueryConstraint[] = [];

        if (options.onlyAvailable) {
          constraints.push(where('availabilityStatus', '==', 'online'));
        }

        const sortMode = options.sortMode ?? 'best';
        if (sortMode === 'topRated') {
          constraints.push(orderBy('rating', 'desc'));
        } else {
          constraints.push(orderBy('createdAt', 'desc'));
        }

        constraints.push(limit(options.fetchLimit ?? 50));

        const snap = await getDocs(
          query(collection(db, 'service_providers'), ...constraints),
        );
        raw = snap.docs.map((d) => ({
          ...(d.data() as ServiceProvider),
          id: d.id,
        }));
      }

      const matched = matchProviders(raw, options);
      const resultLimit = options.fetchLimit;
      setProviders(
        resultLimit != null ? matched.slice(0, resultLimit) : matched,
      );
    } catch (e) {
      console.error('useMatchedProviders error', e);
      setError('Could not load workers. Pull to refresh.');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [
    options.coords,
    options.maxDistanceKm,
    options.problemSlug,
    options.professionId,
    options.searchText,
    options.onlyAvailable,
    options.emergencyOnly,
    options.minRating,
    options.sortMode,
    options.fetchLimit,
  ]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { providers, loading, error, refresh: fetchProviders };
}
