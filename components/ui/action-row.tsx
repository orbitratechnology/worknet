import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type ActionRowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
  badge?: string;
};

export const ActionRow = React.memo(function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  destructive,
  badge,
}: ActionRowProps) {
  const theme = useTheme();
  const color = destructive ? theme.error : theme.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.muted },
      ]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: destructive ? theme.error + '12' : theme.muted,
            borderColor: destructive ? theme.error + '25' : theme.border,
          },
        ]}>
        <Feather
          name={icon}
          size={18}
          color={destructive ? theme.error : theme.icon}
        />
      </View>
      <View style={styles.textBlock}>
        <ThemedText style={[styles.title, { color }]}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.muted }]}>
          <ThemedText style={[styles.badgeText, { color: theme.subtext }]}>
            {badge}
          </ThemedText>
        </View>
      ) : null}
      <Feather
        name='chevron-right'
        size={16}
        color={destructive ? theme.error : theme.icon}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Layout.screenPadding,
    minHeight: Layout.minTouch + 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
