import { Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type BottomSheetHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  destructiveAction?: boolean;
};

export function BottomSheetHeader({
  title,
  actionLabel,
  onAction,
  destructiveAction,
}: BottomSheetHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <ThemedText style={styles.title} type='defaultSemiBold'>
        {title}
      </ThemedText>
      {onAction && actionLabel ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction();
          }}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText
            style={[
              styles.action,
              { color: destructiveAction ? theme.error : theme.accent },
            ]}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

type BottomSheetHeroProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
};

export function BottomSheetHero({ icon, title, subtitle }: BottomSheetHeroProps) {
  const theme = useTheme();

  return (
    <View style={styles.hero}>
      <View style={[styles.iconWrap, { backgroundColor: theme.muted }]}>
        <Feather name={icon} size={28} color={theme.text} />
      </View>
      <ThemedText style={styles.heroTitle} type='defaultSemiBold'>
        {title}
      </ThemedText>
      <ThemedText style={[styles.heroSubtitle, { color: theme.subtext }]}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 16,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    ...Typography.title,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  action: {
    fontSize: 15,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
});
