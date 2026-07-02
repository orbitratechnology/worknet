import { Layout, Typography } from '@/constants/theme';
import { useSurfaceStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '../themed-text';
import { FieldInfoButton } from './field-info-button';

type FormSectionProps = ViewProps & {
  title: string;
  /** Optional hint shown via info icon next to the section title. */
  hint?: string;
  icon?: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
  /** Plain = label group only, no card background (for wizards). */
  variant?: 'card' | 'plain';
};

export function FormSection({
  title,
  hint,
  icon,
  children,
  variant = 'card',
  style,
  ...rest
}: FormSectionProps) {
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle();
  const isPlain = variant === 'plain';

  return (
    <View
      style={[
        isPlain ? styles.plain : styles.card,
        !isPlain && {
          backgroundColor: theme.card,
          ...surfaceStyle,
        },
        style,
      ]}
      {...rest}>
      <View style={[styles.header, isPlain && styles.plainHeader]}>
        {icon ? (
          <View style={[styles.iconBadge, { backgroundColor: theme.muted }]}>
            <Feather name={icon} size={16} color={theme.text} />
          </View>
        ) : null}
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <ThemedText
              style={[
                styles.title,
                isPlain && styles.plainTitle,
                isPlain && { color: theme.text },
              ]}
              selectable>
              {title}
            </ThemedText>
            {hint ? <FieldInfoButton message={hint} title={title} /> : null}
          </View>
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export const formFieldStyles = StyleSheet.create({
  group: {
    width: '100%',
    marginBottom: Layout.fieldGap,
  },
  groupLast: {
    width: '100%',
    marginBottom: 0,
  },
  label: {
    ...Typography.callout,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 0,
  },
  hint: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  input: {
    width: '100%',
    height: Layout.fieldHeight,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '500',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.itemGap,
    width: '100%',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    minHeight: Layout.minTouch,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: Layout.itemGap,
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: Layout.itemGap,
    minHeight: Layout.minTouch,
  },
  actionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    minHeight: Layout.fieldHeight,
    marginTop: Layout.itemGap,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  card: {
    padding: Layout.blockGap + 4,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    width: '100%',
  },
  plain: {
    width: '100%',
    gap: Layout.fieldGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Layout.fieldGap,
  },
  plainHeader: {
    marginBottom: 0,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plainTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    width: '100%',
  },
});
