import {
  WizardFooter,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSurfaceStyle } from '@/hooks/use-surface-style';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const STEPS = [
  { label: 'Your name and photo', icon: 'user' as const },
  { label: 'Phone and NIC verification', icon: 'shield' as const },
  { label: 'Choose your profession', icon: 'briefcase' as const },
  { label: 'Set your city location', icon: 'map-pin' as const },
  { label: 'Add optional details', icon: 'edit-3' as const },
  { label: 'Review and publish', icon: 'check-circle' as const },
];

export default function BecomeWorkerWelcome() {
  const router = useRouter();
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle('soft');

  return (
    <WizardScreen
      step={1}
      total={7}
      title='Start earning as a Worker'
      footer={
        <WizardFooter
          onNext={() => router.push('/(app)/become-worker/identity')}
          nextLabel='Get Started'
        />
      }>
      <View
        style={[
          styles.heroCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
          surfaceStyle,
        ]}>
        <MaterialCommunityIcons name='hard-hat' size={24} color={theme.text} />
        <View style={styles.heroTextBlock}>
          <ThemedText style={styles.heroTitle}>About 5 minutes</ThemedText>
          <ThemedText style={[styles.heroSub, { color: theme.subtext }]}>
            You can save progress and finish later.
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
        What you will need
      </ThemedText>

      <View
        style={[
          styles.stepsList,
          { backgroundColor: theme.surface, borderColor: theme.border },
          surfaceStyle,
        ]}>
        {STEPS.map((step, i) => (
          <View key={step.label}>
            <View style={styles.stepRow}>
              <View
                style={[styles.stepIcon, { backgroundColor: theme.muted }]}>
                <Feather name={step.icon} size={18} color={theme.text} />
              </View>
              <View style={styles.stepTextBlock}>
                <ThemedText style={[styles.stepNum, { color: theme.subtext }]}>
                  Step {i + 1}
                </ThemedText>
                <ThemedText style={styles.stepText}>{step.label}</ThemedText>
              </View>
            </View>
            {i < STEPS.length - 1 ? (
              <View
                style={[styles.divider, { backgroundColor: theme.divider }]}
              />
            ) : null}
          </View>
        ))}
      </View>

    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.blockGap,
    padding: Layout.blockGap,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    width: '100%',
  },
  heroTextBlock: { flex: 1, gap: 2 },
  heroTitle: { fontSize: 16, fontWeight: '700' },
  heroSub: { fontSize: 14, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  stepsList: {
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    width: '100%',
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.blockGap,
    paddingHorizontal: Layout.blockGap,
    paddingVertical: 14,
    minHeight: Layout.minTouch + 8,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextBlock: { flex: 1, gap: 2 },
  stepNum: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  stepText: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40 + Layout.blockGap + Layout.blockGap,
  },
});
