/**
 * Simple arithmetic mean rounded to one decimal place.
 * Matches Yelp, Google, and App Store — the most common public rating strategy.
 */
export function computeAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const total = ratings.reduce((sum, value) => sum + value, 0);
  return Math.round((total / ratings.length) * 10) / 10;
}

export function formatRatingDisplay(
  rating: number,
  reviewCount: number,
): string {
  if (reviewCount <= 0) return '—';
  return rating.toFixed(1);
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}
