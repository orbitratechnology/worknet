import { PhoneVerifyStep } from '@/components/onboarding/phone-verify-step';
import {
  WizardFooter,
  WizardHint,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { FormSection, formFieldStyles } from '@/components/ui/form-section';
import { useAuth } from '@/context/auth';
import {
  claimNic,
  isIdentityVerified,
  maskNic,
  repairPendingNicVerification,
  savePhoneVerification,
} from '@/lib/user-identity';
import {
  formatNicInput,
  isValidSriLankaNic,
  nicValidationMessage,
} from '@/lib/validation';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';

export default function VerificationStep() {
  const router = useRouter();
  const theme = useTheme();
  const { user, userProfile, refreshUser } = useAuth();
  const [nic, setNic] = useState('');
  const [nicError, setNicError] = useState('');
  const [loading, setLoading] = useState(false);

  const nicVerified = !!userProfile?.nicVerified && !!userProfile?.nicNumber;
  const phoneVerified =
    !!userProfile?.phoneVerified && !!userProfile?.phoneNumber;
  const identityVerified = isIdentityVerified(userProfile);

  useEffect(() => {
    if (!user?.uid || identityVerified) return;
    repairPendingNicVerification(user.uid)
      .then((repaired) => {
        if (repaired) return refreshUser();
      })
      .catch(() => {});
  }, [user?.uid, identityVerified, refreshUser]);

  useEffect(() => {
    if (identityVerified) {
      router.replace('/(app)/become-worker/profession');
    }
  }, [identityVerified, router]);

  const handleNicChange = (raw: string) => {
    if (nicVerified) return;
    const formatted = formatNicInput(raw);
    setNic(formatted);
    setNicError(nicValidationMessage(formatted) ?? '');
  };

  const next = async () => {
    if (!user?.uid) return;

    if (!phoneVerified) {
      setNicError('Please verify your phone number first.');
      return;
    }

    if (!nicVerified) {
      const trimmed = nic.trim();
      if (!trimmed) {
        setNicError('Enter your NIC number to continue.');
        return;
      }
      if (!isValidSriLankaNic(trimmed)) {
        setNicError(
          'Enter a valid NIC: 9 digits + V (e.g. 123456789V) or 12 digits.',
        );
        return;
      }

      setLoading(true);
      setNicError('');
      try {
        await claimNic(user.uid, trimmed);
        await refreshUser();
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'Could not verify NIC. Try again.';
        setNicError(message);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    router.push('/(app)/become-worker/profession');
  };

  if (!userProfile && user) {
    return (
      <WizardScreen
        step={3}
        total={7}
        title='Verification'
        footer={<View />}>
        <ActivityIndicator color={theme.accent} />
      </WizardScreen>
    );
  }

  return (
    <WizardScreen
      step={3}
      total={7}
      title='Verification'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!phoneVerified || (!nicVerified && !nic.trim())}
          loading={loading}
        />
      }>
      <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
        We verify your identity to keep Worknet safe for everyone.
      </ThemedText>

      <FormSection title='NIC number' icon='credit-card' variant='plain'>
        {nicVerified ? (
          <View style={styles.lockedRow}>
            <Feather name='lock' size={16} color={theme.subtext} />
            <View style={{ flex: 1, gap: 4 }}>
              <ThemedText style={styles.lockedValue}>
                {maskNic(userProfile!.nicNumber!)}
              </ThemedText>
              <ThemedText style={[styles.lockedHint, { color: theme.subtext }]}>
                NIC is tied to your account and cannot be changed.
              </ThemedText>
            </View>
          </View>
        ) : (
          <>
            <TextInput
              value={nic}
              onChangeText={handleNicChange}
              placeholder='e.g. 200012345678 or 123456789V'
              placeholderTextColor={theme.subtext}
              autoCapitalize='characters'
              maxLength={12}
              keyboardType='default'
              editable={!loading}
              style={[
                formFieldStyles.input,
                {
                  color: theme.text,
                  borderColor: nicError ? theme.error : theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            />
            <ThemedText style={[styles.formatHint, { color: theme.subtext }]}>
              9 digits + V (old) or 12 digits (new). Each NIC can only be used once.
            </ThemedText>
          </>
        )}
      </FormSection>

      <FormSection title='Phone verification' icon='smartphone' variant='plain'>
        <PhoneVerifyStep
          verified={phoneVerified}
          phoneNumber={userProfile?.phoneNumber ?? ''}
          onVerified={async (phone) => {
            if (!user?.uid) return;
            setNicError('');
            await savePhoneVerification(user.uid, phone);
            await refreshUser();
          }}
        />
      </FormSection>

      {nicError ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {nicError}
        </ThemedText>
      ) : null}

      <WizardHint>
        Your verified NIC and phone are shown on your worker profile and cannot be
        changed later.
      </WizardHint>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  error: { fontSize: 13, marginTop: 4 },
  formatHint: { fontSize: 12, marginTop: 6 },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  lockedValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  lockedHint: { fontSize: 13, lineHeight: 18 },
});
