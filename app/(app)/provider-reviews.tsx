import { ThemedText } from '@/components/themed-text';
import { ReviewFilterBar } from '@/components/reviews/review-filter-bar';
import { ReviewList } from '@/components/reviews/review-list';
import { ReviewRatingSummary } from '@/components/reviews/review-rating-summary';
import {
  WriteReviewSheet,
  WriteReviewSheetRef,
} from '@/components/reviews/write-review-sheet';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuthGate } from '@/context/auth-gate';
import { useAuth } from '@/context/auth';
import {
  filterReviewsByRating,
  ReviewRatingFilter,
  ReviewSort,
  sortReviews,
  useProviderReviews,
} from '@/hooks/use-provider-reviews';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { computeAverageRating } from '@/lib/ratings';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export default function ProviderReviewsScreen() {
  const { id, name, rating } = useLocalSearchParams<{
    id: string;
    name?: string;
    rating?: string;
  }>();
  const { user } = useAuth();
  const { gateAction } = useAuthGate();
  const theme = useTheme();
  const { bottom } = useScreenInsets();
  const reviewSheetRef = useRef<WriteReviewSheetRef>(null);

  const [sort, setSort] = useState<ReviewSort>('newest');
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>('all');

  const { reviews, loading, error, refresh } = useProviderReviews(id);
  const hasUserReview = !!user && reviews.some((r) => r.userId === user.uid);

  const filteredReviews = useMemo(() => {
    const filtered = filterReviewsByRating(reviews, ratingFilter);
    return sortReviews(filtered, sort);
  }, [reviews, ratingFilter, sort]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return Number.parseFloat(rating ?? '0') || 0;
    }
    return computeAverageRating(reviews.map((review) => review.rating));
  }, [reviews, rating]);

  const providerName = name ?? 'Worker';

  return (
    <ScreenShell>
      <StackHeader title='Reviews' />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={theme.text} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(bottom, 24) + 80 },
          ]}>
          {error ? (
            <ThemedText style={{ color: theme.subtext }} selectable>
              {error}
            </ThemedText>
          ) : null}

          <ReviewRatingSummary
            reviews={reviews}
            averageRating={averageRating}
          />

          <ReviewFilterBar
            sort={sort}
            ratingFilter={ratingFilter}
            onSortChange={setSort}
            onRatingFilterChange={setRatingFilter}
          />

          <View style={styles.listHeader}>
            <ThemedText style={styles.listTitle} type='headline' selectable>
              {filteredReviews.length} result
              {filteredReviews.length === 1 ? '' : 's'}
            </ThemedText>
            {!user ? (
              <Pressable
                onPress={() =>
                  gateAction('Sign in to leave a review', () => {})
                }>
                <ThemedText style={{ color: theme.accent, fontWeight: '600' }}>
                  Sign in to review
                </ThemedText>
              </Pressable>
            ) : !hasUserReview ? (
              <Pressable onPress={() => reviewSheetRef.current?.open()}>
                <ThemedText style={{ color: theme.accent, fontWeight: '600' }}>
                  Write review
                </ThemedText>
              </Pressable>
            ) : null}
          </View>

          <ReviewList reviews={filteredReviews} />
        </ScrollView>
      )}

      {id ? (
        <WriteReviewSheet
          ref={reviewSheetRef}
          providerId={id}
          providerName={providerName}
          onSubmitted={refresh}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: 12,
    gap: Layout.sectionGap,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  listTitle: {
    letterSpacing: -0.3,
  },
});
