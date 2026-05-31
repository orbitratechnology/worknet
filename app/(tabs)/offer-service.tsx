import { ThemedText } from '@/components/themed-text';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { cardShadow, Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const STEPS = [
  'Choose your profession',
  'Add a photo and short bio',
  'Set your service area',
  'Add phone and WhatsApp',
  'Publish instantly',
];

export default function OfferServiceScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { requireAuth } = useRequireAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const { contentBottom } = useScreenInsets({ tabBar: true });
  const isProvider = !!userProfile?.isServiceProvider;

  const handlePrimaryAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!requireAuth('Sign in to offer your service')) {
      return;
    }

    if (isProvider) {
      router.push('/(app)/provider-profile');
      return;
    }

    router.push('/(app)/enroll-provider');
  };

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title='Offer Service'
          subtitle='Get listed in minutes. No approval delay.'
        />

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.text,
              boxShadow: cardShadow(colorScheme),
            },
          ]}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name='briefcase-outline'
              size={28}
              color={theme.onAccent}
            />
          </View>
          <ThemedText style={styles.heroTitle} selectable>
            {isProvider
              ? 'Manage your provider profile'
              : 'Turn your skills into local work'}
          </ThemedText>
          <ThemedText style={styles.heroBody} selectable>
            {isProvider
              ? 'Update availability, pricing, and service area anytime.'
              : 'Join workers across Sri Lanka and get contacted by phone or WhatsApp.'}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionLabel, { color: theme.subtext }]}
            selectable>
            How it works
          </ThemedText>
          {STEPS.map((step, index) => (
            <View
              key={step}
              style={[
                styles.stepRow,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: theme.text },
                ]}>
                <ThemedText
                  style={[styles.stepNumber, { color: theme.onAccent }]}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.stepText} selectable>
                {step}
              </ThemedText>
            </View>
          ))}
        </View>

        <HapticPressable
          onPress={handlePrimaryAction}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: theme.text,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <Feather
            name={isProvider ? 'edit-3' : 'plus-circle'}
            size={20}
            color={theme.onAccent}
          />
          <ThemedText style={[styles.primaryBtnText, { color: theme.onAccent }]}>
            {isProvider ? 'Edit Provider Profile' : 'Start Offering Service'}
          </ThemedText>
        </HapticPressable>

        {!user ? (
          <ThemedText style={[styles.note, { color: theme.subtext }]} selectable>
            Browsing is free. Sign in only when you are ready to publish.
          </ThemedText>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.sectionGap,
  },
  heroCard: {
    borderRadius: Layout.cardRadius,
    padding: 24,
    gap: 12,
    borderCurve: 'continuous',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FAF7F2',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroBody: {
    color: 'rgba(250, 247, 242, 0.82)',
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: Layout.chipRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderCurve: 'continuous',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
