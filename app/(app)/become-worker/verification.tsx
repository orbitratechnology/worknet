import { PhoneVerifyStep } from '@/components/onboarding/phone-verify-step';
import {
  WizardFooter,
  WizardHint,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { FormSection, formFieldStyles } from '@/components/ui/form-section';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import { isValidSriLankaNic } from '@/lib/validation';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export default function VerificationStep() {
  const router = useRouter();
  const theme = useTheme();
  const { draft, updateDraft } = useWorkerOnboarding();
  const [nic, setNic] = useState(draft.nicNumber);
  const [nicError, setNicError] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(draft.phoneVerified);
  const [phoneNumber, setPhoneNumber] = useState(draft.phoneNumber);

  const next = async () => {
    if (!isValidSriLankaNic(nic)) {
      setNicError('Enter a valid Sri Lanka NIC (9 digits + V/X or 12 digits).');
      return;
    }
    if (!phoneVerified) {
      setNicError('Please verify your phone number first.');
      return;
    }
    await updateDraft({ nicNumber: nic.trim(), phoneVerified, phoneNumber });
    router.push('/(app)/become-worker/profession');
  };

  return (
    <WizardScreen
      step={3}
      total={7}
      title='Verification'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!phoneVerified || !nic.trim()}
        />
      }>
      <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
        We verify your identity to keep Worknet safe for everyone.
      </ThemedText>

      <FormSection title='NIC number' icon='credit-card' variant='plain'>
        <TextInput
          value={nic}
          onChangeText={(t) => {
            setNic(t);
            setNicError('');
          }}
          placeholder='e.g. 200012345678 or 123456789V'
          placeholderTextColor={theme.subtext}
          autoCapitalize='characters'
          style={[
            formFieldStyles.input,
            {
              color: theme.text,
              borderColor: nicError ? theme.error : theme.border,
              backgroundColor: theme.surface,
            },
          ]}
        />
      </FormSection>

      <FormSection title='Phone verification' icon='smartphone' variant='plain'>
        <PhoneVerifyStep
          verified={phoneVerified}
          phoneNumber={phoneNumber}
          onVerified={(phone) => {
            setPhoneVerified(true);
            setPhoneNumber(phone);
            setNicError('');
          }}
        />
      </FormSection>

      {nicError ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {nicError}
        </ThemedText>
      ) : null}

      <WizardHint>
        Your NIC is stored securely and is not shown on your public profile.
      </WizardHint>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  error: { fontSize: 13, marginTop: 4 },
});
