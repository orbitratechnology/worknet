import { Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type SectionHeaderProps = {
  title: string;
  /** @deprecated Prefer `actionIcon` for compact actions */
  actionLabel?: string;
  actionIcon?: React.ComponentProps<typeof Feather>['name'];
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  actionIcon = 'arrow-right',
  onActionPress,
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title} selectable>
        {title}
      </ThemedText>
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
            {
              backgroundColor: theme.muted,
              borderColor: theme.border,
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
    paddingVertical: 14,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 14,
  },
  title: {
    ...Typography.title,
    fontSize: 20,
  },
  iconAction: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    borderRadius: Layout.minTouch / 2,
    borderWidth: 1,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
