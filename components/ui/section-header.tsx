import { Layout, Typography } from '@/constants/theme';
import { useFieldStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** @deprecated Prefer `actionIcon` for compact actions */
  actionLabel?: string;
  actionIcon?: React.ComponentProps<typeof Feather>['name'];
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon = 'arrow-right',
  onActionPress,
}: SectionHeaderProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <ThemedText style={styles.title} selectable>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {onActionPress ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onActionPress();
          }}
          accessibilityRole='button'
          accessibilityLabel={actionLabel ?? 'See all'}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconAction,
            fieldStyle,
            {
              backgroundColor: theme.muted,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Feather name={actionIcon} size={18} color={theme.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Layout.screenPadding,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingRight: 8,
  },
  title: {
    ...Typography.title,
    fontSize: 20,
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 13,
  },
  iconAction: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    borderRadius: Layout.minTouch / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
