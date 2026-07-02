import { ThemedText } from '@/components/themed-text';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { getNextRadiusKm, RADIUS_OPTIONS_KM } from '@/constants/search-defaults';
import { Layout } from '@/constants/theme';
import { useFieldStyle } from '@/hooks/use-surface-style';
import type { SriLankaArea } from '@/constants/sri-lanka-areas';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface NearbyEmptyStateProps {
  searchLabel: string;
  radiusKm: number;
  fallbackArea: SriLankaArea | null;
  onExpandRadius: () => void;
  onSearchArea: (area: SriLankaArea) => void;
  onViewMap: () => void;
}

export function NearbyEmptyState({
  searchLabel,
  radiusKm,
  fallbackArea,
  onExpandRadius,
  onSearchArea,
  onViewMap,
}: NearbyEmptyStateProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const nextRadius = getNextRadiusKm(radiusKm);
  const maxRadius = RADIUS_OPTIONS_KM[RADIUS_OPTIONS_KM.length - 1];

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.muted }]}>
        <Feather name='map-pin' size={22} color={theme.subtext} />
      </View>

      <ThemedText style={styles.title} type='defaultSemiBold'>
        No workers within {radiusKm} km
      </ThemedText>
      <ThemedText style={[styles.body, { color: theme.subtext }]}>
        We couldn&apos;t find available workers near {searchLabel}. Try one of
        these options:
      </ThemedText>

      <View style={styles.actions}>
        {nextRadius ? (
          <HapticPressable
            onPress={onExpandRadius}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: theme.accent,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Feather name='maximize-2' size={16} color={theme.onAccent} />
            <ThemedText
              style={[styles.primaryBtnText, { color: theme.onAccent }]}>
              Expand to {nextRadius} km
            </ThemedText>
          </HapticPressable>
        ) : null}

        {fallbackArea ? (
          <HapticPressable
            onPress={() => onSearchArea(fallbackArea)}
            style={({ pressed }) => [
              styles.secondaryBtn,
              fieldStyle,
              {
                backgroundColor: theme.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Feather name='navigation' size={16} color={theme.text} />
            <ThemedText style={styles.secondaryBtnText}>
              Search in {fallbackArea.name}
            </ThemedText>
          </HapticPressable>
        ) : null}

        <HapticPressable
          onPress={onViewMap}
          style={({ pressed }) => [
            styles.secondaryBtn,
            fieldStyle,
            {
              backgroundColor: theme.surface,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Feather name='map' size={16} color={theme.text} />
          <ThemedText style={styles.secondaryBtnText}>View on map</ThemedText>
        </HapticPressable>
      </View>

      {radiusKm >= maxRadius && !fallbackArea ? (
        <ThemedText style={[styles.hint, { color: theme.subtext }]}>
          Check back later as more workers join Worknet in your area.
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Layout.sectionGap,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: Layout.minTouch,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: Layout.minTouch,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
