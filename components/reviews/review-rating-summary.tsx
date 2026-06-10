import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { Review } from '@/types/database';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type ReviewRatingSummaryProps = {
  reviews: Review[];
  averageRating: number;
};

export function ReviewRatingSummary({
  reviews,
  averageRating,
}: ReviewRatingSummaryProps) {
  const theme = useTheme();

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const review of reviews) {
      const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) - 1;
      counts[bucket] += 1;
    }
    const total = reviews.length || 1;
    return counts
      .map((count, index) => ({
        stars: index + 1,
        count,
        percent: (count / total) * 100,
      }))
      .reverse();
  }, [reviews]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}>
      <View style={styles.scoreCol}>
        <ThemedText style={styles.score} selectable>
          {averageRating.toFixed(1)}
        </ThemedText>
        <View style={styles.stars}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Feather
              key={index}
              name='star'
              size={14}
              color={index < Math.round(averageRating) ? '#FFB300' : theme.border}
            />
          ))}
        </View>
        <ThemedText style={[styles.total, { color: theme.subtext }]} selectable>
          {reviews.length} review{reviews.length === 1 ? '' : 's'}
        </ThemedText>
      </View>

      <View style={styles.barsCol}>
        {distribution.map((row) => (
          <View key={row.stars} style={styles.barRow}>
            <ThemedText
              style={[styles.barLabel, { color: theme.subtext }]}
              selectable>
              {row.stars}
            </ThemedText>
            <View style={[styles.track, { backgroundColor: theme.muted }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${row.percent}%`,
                    backgroundColor: theme.text,
                  },
                ]}
              />
            </View>
            <ThemedText
              style={[styles.barCount, { color: theme.subtext }]}
              selectable>
              {row.count}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 20,
    padding: 16,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  scoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    gap: 6,
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  total: {
    fontSize: 12,
    fontWeight: '600',
  },
  barsCol: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 12,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    borderCurve: 'continuous',
  },
  barCount: {
    width: 20,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
