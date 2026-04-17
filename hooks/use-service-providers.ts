import { useLocation } from '@/context/location';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import {
  collection,
  limit,
  onSnapshot,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

/**
 * A hook to fetch service providers with optional filters.
 * Centralizing this logic makes screens smaller and the logic reusable.
 */
export function useServiceProviders(
  options: {
    category?: string | null;
    onlyAvailable?: boolean;
    limitCount?: number;
  } = {},
) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { country } = useLocation();

  useEffect(() => { 
    const constraints: QueryConstraint[] = [];

    if (options.onlyAvailable) {
      constraints.push(where('availabilityStatus', '==', 'online'));
    }

    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }

    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(collection(db, 'service_providers'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ServiceProvider[];

        // Apply coverage area logic
        // Since we moved to a radius-based approach, we don't filter by 'Country' anymore here.
        // The actual distance filtering should happen via getNearbyProviders or client-side distance checks.
        // For this general hook, we just return the data.

        setProviders(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching service providers:', err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [options.category, options.onlyAvailable, options.limitCount, country]);

  return { providers, loading, error };
}
