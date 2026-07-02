import { RADIUS_OPTIONS_KM } from '@/constants/search-defaults';
import { chipBorderWidth, getFieldStyle, Layout } from '@/constants/theme';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface RadiusChipsProps {
  value: number;
  onChange: (km: number) => void;
  compact?: boolean;
}

/** Tap-to-select distance chips — avoids slider vs bottom-sheet gesture conflicts. */
export function RadiusChips({ value, onChange, compact }: RadiusChipsProps) {
  const theme = useTheme();
  const scheme = useColorSchemeMode();

  return (
    <View
      style={[styles.row, compact ? styles.rowCompact : undefined]}>
      {RADIUS_OPTIONS_KM.map((km) => {
        const selected = value === km;
        return (
          <Pressable
            key={km}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(km);
            }}
            style={({ pressed }) => [
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
              { opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole='button'
            accessibilityState={{ selected }}
            accessibilityLabel={`Within ${km} kilometres`}>
            <ThemedText
              style={[
                styles.chipText,
                { color: selected ? theme.onAccent : theme.text },
              ]}>
              {km} km
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Layout.screenPadding,
  },
  rowCompact: {
    paddingHorizontal: 0,
  },
  chip: {
    borderCurve: 'continuous',
    borderRadius: Layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
