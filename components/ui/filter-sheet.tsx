import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

export interface FilterOptions {
  sortBy: string;
  rating: string;
  distance: number;
  priceRange?: string;
}

export interface FilterSheetProps {
  onApply: (filters: FilterOptions) => void;
  onClose?: () => void;
  initialFilters?: FilterOptions;
}

const SORT_OPTIONS = [
  { label: 'Best Match', icon: 'zap' },
  { label: 'Nearest', icon: 'navigation' },
  { label: 'Highest Rating', icon: 'star' },
  { label: 'Most Experienced', icon: 'award' },
] as const;

const PRICE_OPTIONS = ['All', '< LKR 1k', 'LKR 1k–3k', '> LKR 3k'] as const;

export function FilterSheet({
  onApply,
  initialFilters,
}: FilterSheetProps) {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'Nearest');
  const [rating, setRating] = useState(initialFilters?.rating || '4.0 & Up');
  const [distance, setDistance] = useState<number>(
    typeof initialFilters?.distance === 'number' ? initialFilters.distance : 15,
  );
  const [priceRange, setPriceRange] = useState(
    initialFilters?.priceRange || 'All',
  );

  const reset = () => {
    setSortBy('Nearest');
    setRating('4.0 & Up');
    setDistance(15);
    setPriceRange('All');
  };

  const handleApply = () => {
    onApply({ sortBy, rating, distance, priceRange });
  };

  return (
    <View style={styles.container}>
      <BottomSheetHeader
        title='Filter & Sort'
        actionLabel='Reset'
        onAction={reset}
      />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
          Sort by
        </ThemedText>
        {SORT_OPTIONS.map((item) => {
          const selected = sortBy === item.label;
          return (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  borderBottomColor: theme.border,
                  backgroundColor: selected ? theme.muted : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => setSortBy(item.label)}>
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: theme.muted },
                  ]}>
                  <Feather
                    name={item.icon}
                    size={18}
                    color={theme.subtext}
                  />
                </View>
                <ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
              </View>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? theme.accent : theme.border },
                ]}>
                {selected ? (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.accent },
                    ]}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
            Distance
          </ThemedText>
          <View
            style={[styles.distanceBadge, { backgroundColor: theme.muted }]}>
            <ThemedText
              style={[styles.distanceBadgeText, { color: theme.text }]}>
              {distance} km
            </ThemedText>
          </View>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={50}
          step={1}
          value={distance}
          onValueChange={setDistance}
          minimumTrackTintColor={theme.accent}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.accent}
        />
        <View style={styles.sliderLabels}>
          <ThemedText style={[styles.sliderLabel, { color: theme.subtext }]}>
            1 km
          </ThemedText>
          <ThemedText style={[styles.sliderLabel, { color: theme.subtext }]}>
            50 km
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
          Price range
        </ThemedText>
        <View style={styles.chipsRow}>
          {PRICE_OPTIONS.map((p) => {
            const selected = priceRange === p;
            return (
              <HapticPressable
                key={p}
                onPress={() => setPriceRange(p)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.accent : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.chipText,
                    { color: selected ? theme.onAccent : theme.text },
                  ]}>
                  {p}
                </ThemedText>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      <HapticPressable
        onPress={handleApply}
        style={({ pressed }) => [
          styles.applyButton,
          { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 },
        ]}>
        <ThemedText
          style={[styles.applyButtonText, { color: theme.onAccent }]}
          type='defaultSemiBold'>
          Apply Filters
        </ThemedText>
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderCurve: 'continuous',
    minHeight: Layout.minTouch,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    minHeight: 40,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    minHeight: Layout.minTouch + 12,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  applyButtonText: {
    fontSize: 16,
  },
});
