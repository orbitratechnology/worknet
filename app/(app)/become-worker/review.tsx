import {
  WizardFooter,
  WizardHint,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import {
  profileCompleteness,
  useWorkerOnboarding,
} from '@/hooks/use-worker-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { formatLanguagesLabel } from '@/constants/worker-languages';
import { publishWorkerProfile } from '@/lib/publish-worker';
import { getUserFacingMessage } from '@/lib/user-errors';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function ReviewStep() {
  const router = useRouter();
  const theme = useTheme();
  const { user, refreshUser } = useAuth();
  const { draft, clearDraft } = useWorkerOnboarding();
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await publishWorkerProfile(user, draft);
      await clearDraft();
      await refreshUser();
      router.replace('/(tabs)/offer-service');
    } catch (e: unknown) {
      Alert.alert('Could not publish', getUserFacingMessage(e, 'generic'));
    } finally {
      setLoading(false);
    }
  };

  const completeness = profileCompleteness(draft);

  return (
    <WizardScreen
      step={7}
      total={7}
      title='Review and publish'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={publish}
          nextLabel='Publish Profile'
          loading={loading}
        />
      }>
      <View style={styles.completenessBlock}>
        <View style={styles.completenessHeader}>
          <ThemedText style={styles.completenessTitle} type='defaultSemiBold'>
            Profile strength
          </ThemedText>
          <ThemedText
            style={[
              styles.completenessValue,
              { color: completeness >= 80 ? theme.success : theme.text },
            ]}>
            {completeness}%
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor:
                  completeness >= 80 ? theme.success : theme.accent,
                width: `${completeness}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.profileRow}>
        {draft.imageUri ? (
          <Image source={{ uri: draft.imageUri }} style={styles.avatar} />
        ) : null}
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText style={styles.name} type='defaultSemiBold'>
            {draft.name}
          </ThemedText>
          <ThemedText style={{ color: theme.subtext }}>
            {draft.primaryProfession}
          </ThemedText>
          <View style={styles.locationRow}>
            <Feather name='map-pin' size={12} color={theme.subtext} />
            <ThemedText style={{ color: theme.subtext, fontSize: 13 }}>
              {draft.homeCity}, {draft.country}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.detailsList, { borderColor: theme.border }]}>
        <ReviewRow
          label='Phone'
          value={draft.phoneNumber}
          verified={draft.phoneVerified}
        />
        <ReviewRow label='NIC' value='•••••••••' verified />
        {draft.languages.length ? (
          <ReviewRow
            label='Languages'
            value={formatLanguagesLabel(draft.languages)}
          />
        ) : null}
        {draft.bio ? <ReviewRow label='Bio' value={draft.bio} /> : null}
        {draft.baseRate ? (
          <ReviewRow label='Rate' value={`LKR ${draft.baseRate}/hr`} />
        ) : null}
        {draft.workSampleUris.length ? (
          <ReviewRow
            label='Work photos'
            value={`${draft.workSampleUris.length} uploaded`}
          />
        ) : null}
        {draft.emergencyAvailability ? (
          <ReviewRow label='Emergency' value='Available' />
        ) : null}
      </View>

      <WizardHint>
        Your profile publishes visible in search. Toggle availability anytime on
        your Worker dashboard.
      </WizardHint>
    </WizardScreen>
  );
}

function ReviewRow({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.reviewRow, { borderColor: theme.border }]}>
      <ThemedText style={[styles.reviewLabel, { color: theme.subtext }]}>
        {label}
      </ThemedText>
      <View style={styles.reviewValueRow}>
        <ThemedText style={styles.reviewValue}>{value}</ThemedText>
        {verified ? (
          <Feather name='check-circle' size={14} color={theme.success} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  completenessBlock: {
    gap: 10,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completenessTitle: { fontSize: 15 },
  completenessValue: { fontSize: 18, fontWeight: '700' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  profileRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  name: { fontSize: 18 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  reviewValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewValue: { fontSize: 15, flex: 1 },
});
