import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { Review } from '@/types/database';
import { useSurfaceStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

function formatReviewDate(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function reviewAvatarUri(name: string, photoUrl?: string) {
  return (
    photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=222222&color=FAF7F2&bold=true&size=128`
  );
}

function ReviewAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const theme = useTheme();

  return (
    <Image
      source={{ uri: reviewAvatarUri(name, photoUrl) }}
      style={[styles.avatar, { backgroundColor: theme.muted }]}
      contentFit='cover'
      transition={200}
      accessibilityLabel={`${name} profile photo`}
    />
  );
}

type ReviewListProps = {
  reviews: Review[];
  onReportReview?: (review: Review) => void;
};

export function ReviewList({ reviews, onReportReview }: ReviewListProps) {
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle('soft');

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
          style={[styles.item, { borderColor: theme.border, backgroundColor: theme.card }, surfaceStyle]}>
          <ReviewAvatar name={review.userName} photoUrl={review.userPhotoUrl} />
          <View style={styles.itemBody}>
            <View style={styles.itemHeader}>
              <ThemedText style={styles.userName} type='defaultSemiBold' numberOfLines={1}>
                {review.userName}
              </ThemedText>
              <View style={styles.headerRight}>
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
                {onReportReview ? (
                  <Pressable
                    onPress={() => onReportReview(review)}
                    hitSlop={8}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                    <Feather name='flag' size={16} color={theme.subtext} />
                  </Pressable>
                ) : null}
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
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Layout.itemGap },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: 'continuous',
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userName: { fontSize: 15, flex: 1, minWidth: 0 },
  stars: { flexDirection: 'row', gap: 2 },
  comment: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
