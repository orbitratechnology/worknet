import {
  WizardFooter,
  WizardHint,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const STEPS = [
  { label: 'Your name and photo', icon: 'user' as const },
  { label: 'NIC and phone verification', icon: 'shield' as const },
  { label: 'Choose your profession', icon: 'briefcase' as const },
  { label: 'Set your city location', icon: 'map-pin' as const },
  { label: 'Add optional details', icon: 'edit-3' as const },
  { label: 'Review and publish', icon: 'check-circle' as const },
];

export default function BecomeWorkerWelcome() {
  const router = useRouter();
  const theme = useTheme();

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
      <ThemedText style={[styles.intro, { color: theme.subtext }]}>
        Join Worknet as a skilled worker. Customers nearby can find you,
        view your profile, and contact you directly.
      </ThemedText>

      <View style={styles.heroRow}>
        <MaterialCommunityIcons name='hard-hat' size={28} color={theme.text} />
        <ThemedText style={styles.heroText}>Takes about 5 minutes</ThemedText>
      </View>

      <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
        What you will need
      </ThemedText>

      <View style={[styles.stepsList, { borderColor: theme.border }]}>
        {STEPS.map((step, i) => (
          <View key={step.label}>
            <View style={styles.stepRow}>
              <Feather name={step.icon} size={18} color={theme.text} />
              <View style={styles.stepTextBlock}>
                <ThemedText style={[styles.stepNum, { color: theme.subtext }]}>
                  Step {i + 1}
                </ThemedText>
                <ThemedText style={styles.stepText}>{step.label}</ThemedText>
              </View>
            </View>
            {i < STEPS.length - 1 ? (
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
            ) : null}
          </View>
        ))}
      </View>

      <WizardHint>
        Your NIC is stored securely and never shown on your public profile.
      </WizardHint>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 15, lineHeight: 22 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroText: { fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 16 },
  stepsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    minHeight: Layout.minTouch,
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
    marginLeft: 32,
  },
});
