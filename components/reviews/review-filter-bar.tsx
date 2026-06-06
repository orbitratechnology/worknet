import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import {
  ReviewRatingFilter,
  ReviewSort,
} from '@/hooks/use-provider-reviews';
import { useTheme } from '@/hooks/use-theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

const SORT_OPTIONS: { id: ReviewSort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'highest', label: 'Highest' },
  { id: 'lowest', label: 'Lowest' },
];

const RATING_OPTIONS: { id: ReviewRatingFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 5, label: '5★' },
  { id: 4, label: '4★' },
  { id: 3, label: '3★' },
  { id: 2, label: '2★' },
  { id: 1, label: '1★' },
];

type ReviewFilterBarProps = {
  sort: ReviewSort;
  ratingFilter: ReviewRatingFilter;
  onSortChange: (sort: ReviewSort) => void;
  onRatingFilterChange: (filter: ReviewRatingFilter) => void;
};

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole='button'
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.text : theme.muted,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <ThemedText
        style={[
          styles.chipText,
          { color: selected ? theme.onAccent : theme.text },
        ]}
        selectable>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function ReviewFilterBar({
  sort,
  ratingFilter,
  onSortChange,
  onRatingFilterChange,
}: ReviewFilterBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <ThemedText style={[styles.label, { color: theme.subtext }]} selectable>
        Sort
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {SORT_OPTIONS.map((option) => (
          <FilterChip
            key={option.id}
            label={option.label}
            selected={sort === option.id}
            onPress={() => onSortChange(option.id)}
          />
        ))}
      </ScrollView>

      <ThemedText style={[styles.label, { color: theme.subtext }]} selectable>
        Rating
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {RATING_OPTIONS.map((option) => (
          <FilterChip
            key={String(option.id)}
            label={option.label}
            selected={ratingFilter === option.id}
            onPress={() => onRatingFilterChange(option.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Layout.screenPadding,
  },
  row: {
    gap: 8,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 2,
  },
  chip: {
    minHeight: Layout.minTouch,
    paddingHorizontal: 14,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
