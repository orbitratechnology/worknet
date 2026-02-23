import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';

export interface FilterOptions {
  sortBy: string;
  rating: string;
  distance: number | string;
  priceRange?: string;
}

export interface FilterSheetProps {
  onApply: (filters: FilterOptions) => void;
  onClose?: () => void;
}

export function FilterSheet({ onApply, onClose }: FilterSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [sortBy, setSortBy] = useState('Nearest');
  const [rating, setRating] = useState('4.0 & Up');
  const [distance, setDistance] = useState<number | string>(15);
  const [priceRange, setPriceRange] = useState('All');

  const handleApply = () => {
    onApply({
      sortBy,
      rating,
      distance,
      priceRange,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title} type='defaultSemiBold'>
          Filter & Sort
        </ThemedText>
        <TouchableOpacity onPress={onClose}>
          <ThemedText style={[styles.resetText, { color: theme.accent }]}>
            Reset
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
          Sort By
        </ThemedText>
        {[
          { label: 'Nearest', icon: 'navigation' },
          { label: 'Highest Rating', icon: 'star' },
          { label: 'Most Experienced', icon: 'award' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.optionRow, { borderBottomColor: theme.border }]}
            onPress={() => setSortBy(item.label)}>
            <View style={styles.optionLeft}>
              <Feather
                name={item.icon as any}
                size={20}
                color={theme.subtext}
              />
              <ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: theme.border },
                sortBy === item.label && { borderColor: theme.accent },
              ]}>
              {sortBy === item.label && (
                <View
                  style={[styles.radioInner, { backgroundColor: theme.accent }]}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
            Distance
          </ThemedText>
          <View
            style={[
              styles.distanceBadge,
              { backgroundColor: theme.accent + '20' },
            ]}>
            <ThemedText
              style={[styles.distanceBadgeText, { color: theme.accent }]}>
              15 km
            </ThemedText>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <View style={[styles.track, { backgroundColor: theme.border }]} />
          <View
            style={[
              styles.thumb,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
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
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
          Price Range
        </ThemedText>
        <View style={styles.chipsRow}>
          {['All', '< $50', '$50 - $100', '> $100'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.chip,
                { backgroundColor: theme.card, borderColor: theme.border },
                priceRange === p && {
                  backgroundColor: theme.accent,
                  borderColor: theme.accent,
                },
              ]}
              onPress={() => setPriceRange(p)}>
              <ThemedText
                style={[
                  styles.chipText,
                  priceRange === p && { color: theme.onAccent },
                ]}>
                {p}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.applyButton, { backgroundColor: theme.accent }]}
        onPress={handleApply}>
        <ThemedText
          style={[styles.applyButtonText, { color: theme.onAccent }]}
          type='defaultSemiBold'>
          Apply Filters
        </ThemedText>
        <View
          style={[
            styles.countBadge,
            { backgroundColor: theme.onAccent + '20' },
          ]}>
          <ThemedText style={[styles.countText, { color: theme.onAccent }]}>
            24
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
  },
  resetText: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
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
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sliderContainer: {
    paddingTop: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: '30%',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sliderLabel: {
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  applyButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
