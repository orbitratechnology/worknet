import { Layout } from '@/constants/theme';
import { useSearchLocation } from '@/context/search-location';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { RadiusChips } from './radius-chips';

interface RadiusSelectorProps {
  compact?: boolean;
}

export function RadiusSelector({ compact }: RadiusSelectorProps) {
  const { radiusKm, setRadiusKm } = useSearchLocation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        compact ? styles.scrollCompact : undefined,
      ]}>
      <RadiusChips
        value={radiusKm}
        onChange={setRadiusKm}
        compact={compact}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  scrollCompact: {
    paddingHorizontal: 0,
  },
});
