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
};

export function FormSection({
  title,
  icon,
  children,
  style,
  ...rest
}: FormSectionProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          boxShadow: cardShadow(colorScheme),
        },
        style,
      ]}
      {...rest}>
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: theme.muted }]}>
            <Feather name={icon} size={16} color={theme.text} />
          </View>
        ) : null}
        <ThemedText style={styles.title} selectable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
