import { DEFAULT_RADIUS_KM } from '@/constants/search-defaults';
import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { RadiusChips } from '@/components/ui/radius-chips';
import { chipBorderWidth, getFieldStyle, Layout } from '@/constants/theme';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
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
  const scheme = useColorSchemeMode();
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'Nearest');
  const [rating, setRating] = useState(initialFilters?.rating || '4.0 & Up');
  const [distance, setDistance] = useState<number>(
    typeof initialFilters?.distance === 'number'
      ? initialFilters.distance
      : DEFAULT_RADIUS_KM,
  );
  const [priceRange, setPriceRange] = useState(
    initialFilters?.priceRange || 'All',
  );

  const reset = () => {
    setSortBy('Nearest');
    setRating('4.0 & Up');
    setDistance(DEFAULT_RADIUS_KM);
    setPriceRange('All');
  };

  const handleApply = () => {
    onApply({ sortBy, rating, distance, priceRange });
  };

  return (
    <BottomSheetScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps='handled'>
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
                  borderBottomColor: theme.divider,
                  backgroundColor: selected ? theme.muted : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => setSortBy(item.label)}>
              <View style={styles.optionLeft}>
                <View
                  style={[styles.optionIcon, { backgroundColor: theme.muted }]}>
                  <Feather name={item.icon} size={18} color={theme.subtext} />
                </View>
                <ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected
                      ? theme.accent
                      : scheme === 'light'
                        ? theme.divider
                        : theme.border,
                  },
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
        <RadiusChips value={distance} onChange={setDistance} compact />
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
                  selected
                    ? {
                        backgroundColor: theme.accent,
                        borderWidth: chipBorderWidth(scheme, true),
                      }
                    : {
                        backgroundColor: theme.surface,
                        ...getFieldStyle(scheme),
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
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding + 24,
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
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
