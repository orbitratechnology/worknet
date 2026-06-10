import { Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '../themed-text';

type ScreenHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  action,
  style,
  ...rest
}: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.textBlock}>
        <ThemedText
          style={[
            styles.title,
            Platform.OS === 'android' && styles.titleAndroid,
          ]}
          type='largeTitle'
          selectable>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            style={[styles.subtitle, { color: theme.subtext }]}
            type='callout'
            selectable>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    ...Typography.largeTitle,
  },
  titleAndroid: {
    includeFontPadding: false,
  },
  subtitle: {
    maxWidth: '92%',
  },
});
