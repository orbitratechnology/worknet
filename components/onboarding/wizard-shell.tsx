import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useFieldStyle,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface WizardProgressProps {
  step: number;
  total: number;
  title: string;
}

export function WizardProgress({ step, total, title }: WizardProgressProps) {
  const theme = useTheme();
  const progress = step / total;

  return (
    <View style={styles.wrap}>
      <View style={styles.progressMeta}>
        <ThemedText style={[styles.stepLabel, { color: theme.subtext }]}>
          Step {step} of {total}
        </ThemedText>
        <ThemedText style={[styles.percentLabel, { color: theme.subtext }]}>
          {Math.round(progress * 100)}%
        </ThemedText>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: total }).map((_, i) => {
          const index = i + 1;
          const done = index < step;
          const active = index === step;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: done || active ? theme.accent : theme.border,
                  opacity: active ? 1 : done ? 1 : 0.45,
                  flex: active ? 1.4 : 1,
                },
              ]}
            />
          );
        })}
      </View>

      <ThemedText style={styles.title} type='defaultSemiBold'>
        {title}
      </ThemedText>
    </View>
  );
}

interface WizardFooterProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function WizardFooter({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
  loading,
}: WizardFooterProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const router = useRouter();
  const { bottom } = useScreenInsets();

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: theme.divider,
          backgroundColor: theme.background,
          paddingBottom: Math.max(bottom, 12),
        },
      ]}>
      <HapticPressable
        onPress={onBack ?? (() => router.back())}
        style={({ pressed }) => [
          styles.backBtn,
          {
            borderColor: theme.border,
            backgroundColor: theme.surface,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          fieldStyle,
        ]}>
        <Feather name='arrow-left' size={18} color={theme.text} />
        <ThemedText style={[styles.backText, { color: theme.text }]}>
          {onBack ? 'Back' : 'Cancel'}
        </ThemedText>
      </HapticPressable>

      <HapticPressable
        onPress={onNext}
        disabled={nextDisabled || loading}
        style={({ pressed }) => [
          styles.nextBtn,
          {
            backgroundColor: theme.accent,
            opacity: nextDisabled || loading ? 0.45 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed && !nextDisabled ? 0.98 : 1 }],
          },
        ]}>
        {loading ? (
          <ActivityIndicator color={theme.onAccent} />
        ) : (
          <>
            <ThemedText style={[styles.nextText, { color: theme.onAccent }]}>
              {nextLabel}
            </ThemedText>
            <Feather name='arrow-right' size={18} color={theme.onAccent} />
          </>
        )}
      </HapticPressable>
    </View>
  );
}

export function WizardScreen({
  children,
  step,
  total,
  title,
  footer,
  scrollable = true,
}: {
  children: React.ReactNode;
  step: number;
  total: number;
  title: string;
  footer: React.ReactNode;
  scrollable?: boolean;
}) {
  const body = scrollable ? (
    <ScrollView
      style={styles.body}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior='automatic'
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, styles.staticContent]}>{children}</View>
  );

  return (
    <ScreenShell>
      <StackHeader title='Become a Worker' border />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <WizardProgress step={step} total={total} title={title} />
        {body}
        {footer}
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

export function WizardHint({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle('soft');
  return (
    <View
      style={[
        styles.hintRow,
        { backgroundColor: theme.muted, borderColor: theme.border },
        surfaceStyle,
      ]}>
      <Feather name='info' size={16} color={theme.subtext} />
      <ThemedText style={[styles.hintText, { color: theme.subtext }]}>
        {children}
      </ThemedText>
    </View>
  );
}

/** Shared intro copy below wizard titles */
export const wizardIntroStyle = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Layout.blockGap,
  },
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.itemGap,
    paddingBottom: Layout.blockGap,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    ...Typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: Layout.blockGap,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    borderCurve: 'continuous',
  },
  title: {
    ...Typography.title,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  screen: { flex: 1 },
  body: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.sectionGap,
    gap: Layout.formSectionGap,
    width: '100%',
  },
  staticContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.itemGap,
    gap: Layout.formSectionGap,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.blockGap,
    gap: Layout.itemGap,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Layout.blockGap,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    minHeight: Layout.fieldHeight,
    minWidth: 96,
  },
  backText: { fontSize: 15, fontWeight: '600' },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    minHeight: Layout.fieldHeight,
  },
  nextText: { fontSize: 16, fontWeight: '700' },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Layout.blockGap,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    width: '100%',
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
