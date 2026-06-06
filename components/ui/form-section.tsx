import { cardShadow, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '../themed-text';

type FormSectionProps = ViewProps & {
  title: string;
  icon?: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
  /** Plain = label group only, no card background (for wizards). */
  variant?: 'card' | 'plain';
};

export function FormSection({
  title,
  icon,
  children,
  variant = 'card',
  style,
  ...rest
}: FormSectionProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const isPlain = variant === 'plain';

  return (
    <View
      style={[
        isPlain ? styles.plain : styles.card,
        !isPlain && {
          backgroundColor: theme.card,
          boxShadow: cardShadow(colorScheme),
        },
        style,
      ]}
      {...rest}>
      <View style={[styles.header, isPlain && styles.plainHeader]}>
        {icon ? (
          <Feather name={icon} size={16} color={theme.subtext} />
        ) : null}
        <ThemedText
          style={[
            styles.title,
            isPlain && styles.plainTitle,
            isPlain && { color: theme.subtext },
          ]}
          selectable>
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

export const formFieldStyles = StyleSheet.create({
  group: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  input: {
    height: Layout.inputHeight,
    borderRadius: 16,
    borderWidth: 1,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  textarea: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    minHeight: 40,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    gap: 4,
  },
  plain: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  plainHeader: {
    gap: 8,
    marginBottom: 0,
  },
  plainTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
