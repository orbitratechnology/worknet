import { db } from '@/lib/firebase';
import { Review } from '@/types/database';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export type ReviewSort = 'newest' | 'oldest' | 'highest' | 'lowest';
export type ReviewRatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

export function sortReviews(reviews: Review[], sort: ReviewSort): Review[] {
  const sorted = [...reviews];
  switch (sort) {
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0),
      );
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating);
    case 'newest':
    default:
      return sorted.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
      );
  }
}

export function filterReviewsByRating(
  reviews: Review[],
  ratingFilter: ReviewRatingFilter,
): Review[] {
  if (ratingFilter === 'all') return reviews;
  return reviews.filter((review) => review.rating === ratingFilter);
}

export function useProviderReviews(providerId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!providerId) {
      setReviews([]);
      setLoading(false);
      setError('Missing provider ID.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, 'reviews'),
          where('providerId', '==', providerId),
          orderBy('createdAt', 'desc'),
          limit(100),
        ),
      );
      setReviews(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Review[],
      );
    } catch (fetchError) {
      console.error('Error fetching reviews:', fetchError);
      setError('Could not load reviews. Check your connection and try again.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refresh: fetchReviews };
}
