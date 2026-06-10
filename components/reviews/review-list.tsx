import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { Review } from '@/types/database';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

function formatReviewDate(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const theme = useTheme();

  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <Feather name='message-circle' size={32} color={theme.border} />
        <ThemedText style={[styles.emptyText, { color: theme.subtext }]}>
          No reviews yet. Be the first to review.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {reviews.map((review) => (
        <View
          key={review.id}
          style={[styles.item, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={styles.itemHeader}>
            <ThemedText style={styles.userName} type='defaultSemiBold'>
              {review.userName}
            </ThemedText>
            <View style={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Feather
                  key={i}
                  name='star'
                  size={12}
                  color={i < review.rating ? '#FFB300' : theme.border}
                />
              ))}
            </View>
          </View>
          {review.comment ? (
            <ThemedText style={[styles.comment, { color: theme.subtext }]}>
              {review.comment}
            </ThemedText>
          ) : null}
          <ThemedText style={[styles.date, { color: theme.subtext }]}>
            {formatReviewDate(review.createdAt)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Layout.itemGap },
  item: {
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: { fontSize: 15 },
  stars: { flexDirection: 'row', gap: 2 },
  comment: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  date: { fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
