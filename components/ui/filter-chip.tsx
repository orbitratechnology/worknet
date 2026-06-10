import { Layout } from '@/constants/theme';
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

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.text : theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.88 : 1,
        },
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
    borderWidth: 1,
    borderCurve: 'continuous',
    gap: 6,
    minHeight: Layout.minTouch,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
