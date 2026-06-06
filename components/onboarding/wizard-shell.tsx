import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
                  opacity: active ? 1 : done ? 1 : 0.55,
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
  const router = useRouter();
  const { bottom } = useScreenInsets();

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: theme.border,
          paddingBottom: Math.max(bottom, 16),
        },
      ]}>
      <HapticPressable
        onPress={onBack ?? (() => router.back())}
        style={({ pressed }) => [
          styles.backBtn,
          { opacity: pressed ? 0.7 : 1 },
        ]}>
        <Feather name='arrow-left' size={18} color={theme.subtext} />
        <ThemedText style={[styles.backText, { color: theme.subtext }]}>
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
  return (
    <View style={styles.hintRow}>
      <Feather name='info' size={14} color={theme.subtext} />
      <ThemedText style={[styles.hintText, { color: theme.subtext }]}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    paddingBottom: Layout.itemGap,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepLabel: {
    ...Typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  percentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    borderCurve: 'continuous',
  },
  title: {
    ...Typography.title,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  screen: { flex: 1 },
  body: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 24,
    gap: 20,
  },
  staticContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 8,
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: Layout.minTouch,
  },
  backText: { fontSize: 15, fontWeight: '600' },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    minHeight: Layout.minTouch + 8,
  },
  nextText: { fontSize: 16, fontWeight: '700' },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
