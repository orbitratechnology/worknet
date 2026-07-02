import { PhoneVerifyStep } from '@/components/onboarding/phone-verify-step';
import {
  WizardFooter,
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
import {
  useFieldStyle,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
import { Feather } from '@expo/vector-icons';

export default function VerificationStep() {
  const router = useRouter();
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const surfaceStyle = useSurfaceStyle('soft');
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
        setNicError('Please enter your NIC number.');
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
        title='Verify your identity'
        footer={<View />}>
        <ActivityIndicator color={theme.accent} />
      </WizardScreen>
    );
  }

  return (
    <WizardScreen
      step={3}
      total={7}
      title='Verify your identity'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!phoneVerified || (!nicVerified && !nic.trim())}
          loading={loading}
        />
      }>
      <FormSection title='Phone' icon='smartphone' variant='plain'>
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

      <FormSection
        title='NIC number'
        hint='9 digits + V (old format) or 12 digits (new format). Each NIC can only be used once. Your full NIC is never shown publicly.'
        icon='credit-card'
        variant='plain'>
        {nicVerified ? (
          <View
            style={[
              styles.lockedRow,
              { backgroundColor: theme.muted, borderColor: theme.border },
              surfaceStyle,
            ]}>
            <Feather name='lock' size={18} color={theme.subtext} />
            <View style={styles.lockedText}>
              <ThemedText style={styles.lockedValue}>
                {maskNic(userProfile!.nicNumber!)}
              </ThemedText>
              <ThemedText style={[styles.lockedHint, { color: theme.subtext }]}>
                Verified and locked to your account.
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
              accessibilityLabel='NIC number'
              style={[
                formFieldStyles.input,
                {
                  color: theme.text,
                  borderColor: nicError ? theme.error : theme.border,
                  backgroundColor: theme.surface,
                },
                fieldStyle,
              ]}
            />
          </>
        )}
      </FormSection>

      {nicError ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {nicError}
        </ThemedText>
      ) : null}
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 14, lineHeight: 20 },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    width: '100%',
  },
  lockedText: { flex: 1, gap: 4 },
  lockedValue: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  lockedHint: { fontSize: 14, lineHeight: 20 },
});
