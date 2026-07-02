import { getFieldStyle, Layout, softShadow } from '@/constants/theme';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type SegmentedTabsProps<T extends string> = {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
};

export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
}: SegmentedTabsProps<T>) {
  const theme = useTheme();
  const scheme = useColorSchemeMode();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.muted },
        getFieldStyle(scheme),
      ]}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(tab.key);
            }}
            style={({ pressed }) => [
              styles.tab,
              selected && {
                backgroundColor: theme.card,
                boxShadow: softShadow(scheme),
              },
              pressed && { opacity: 0.9 },
            ]}>
            <ThemedText
              style={[
                styles.label,
                { color: selected ? theme.text : theme.subtext },
                selected && { fontWeight: '700' },
              ]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    minHeight: Layout.minTouch - 4,
    borderCurve: 'continuous',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
