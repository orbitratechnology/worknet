import { chipBorderWidth, getFieldStyle, Layout, softShadow } from '@/constants/theme';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function FilterChip({
  label,
  selected = false,
  onPress,
  icon,
  trailing,
}: FilterChipProps) {
  const theme = useTheme();
  const scheme = useColorSchemeMode();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? {
              backgroundColor: theme.text,
              borderWidth: chipBorderWidth(scheme, true),
              ...(scheme === 'light'
                ? { boxShadow: softShadow(scheme) }
                : {}),
            }
          : {
              backgroundColor: theme.card,
              ...getFieldStyle(scheme),
            },
        { opacity: pressed ? 0.88 : 1 },
      ]}>
      {icon}
      <ThemedText
        style={[
          styles.label,
          { color: selected ? theme.background : theme.text },
        ]}
        numberOfLines={1}>
        {label}
      </ThemedText>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    gap: 6,
    minHeight: Layout.minTouch,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
