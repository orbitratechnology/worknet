import { ThemedText } from '@/components/themed-text';
import { formFieldStyles } from '@/components/ui/form-section';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { sendPhoneOtp } from '@/lib/phone-verification';
import { normalizePhoneE164, isValidE164Phone } from '@/lib/validation';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

interface PhoneVerifyStepProps {
  verified: boolean;
  phoneNumber: string;
  onVerified: (phone: string) => void;
}

export function PhoneVerifyStep({
  verified,
  phoneNumber,
  onVerified,
}: PhoneVerifyStepProps) {
  const theme = useTheme();
  const [phone, setPhone] = useState(
    phoneNumber ? phoneNumber.replace('+94', '0') : '',
  );
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<Awaited<
    ReturnType<typeof sendPhoneOtp>
  > | null>(null);

  const inputStyle = {
    color: theme.text,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  };

  const sendOtp = async () => {
    setError('');
    const e164 = normalizePhoneE164(phone);
    if (!isValidE164Phone(e164)) {
      setError('Enter a valid mobile number.');
      return;
    }
    setLoading(true);
    try {
      const conf = await sendPhoneOtp(phone);
      setConfirmation(conf);
      setSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Could not send OTP. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation || otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      await confirmation.confirm(otp);
      onVerified(normalizePhoneE164(phone));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid code';
      setError(`Invalid code. Check and try again. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <View style={styles.verifiedRow}>
        <Feather name='check-circle' size={18} color={theme.success} />
        <ThemedText style={[styles.verifiedText, { color: theme.success }]}>
          Phone verified · {phoneNumber}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.phoneRow}>
        <ThemedText style={[styles.prefix, { color: theme.subtext }]}>+94</ThemedText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder='77 123 4567'
          placeholderTextColor={theme.subtext}
          keyboardType='phone-pad'
          style={[formFieldStyles.input, styles.phoneInput, inputStyle]}
        />
      </View>

      {!sent ? (
        <HapticPressable
          onPress={sendOtp}
          disabled={loading}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: theme.accent,
              opacity: pressed || loading ? 0.85 : 1,
            },
          ]}>
          {loading ? (
            <ActivityIndicator color={theme.onAccent} />
          ) : (
            <ThemedText style={[styles.btnText, { color: theme.onAccent }]}>
              Send OTP
            </ThemedText>
          )}
        </HapticPressable>
      ) : (
        <>
          <ThemedText style={formFieldStyles.label}>Enter 6-digit code</ThemedText>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType='number-pad'
            maxLength={6}
            placeholder='000000'
            placeholderTextColor={theme.subtext}
            style={[
              formFieldStyles.input,
              inputStyle,
              styles.otpInput,
            ]}
          />
          <HapticPressable
            onPress={verifyOtp}
            disabled={loading || otp.length < 6}
            style={({ pressed }) => [
              styles.btn,
              {
                backgroundColor: theme.accent,
                opacity: pressed || loading || otp.length < 6 ? 0.5 : 1,
              },
            ]}>
            {loading ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <ThemedText style={[styles.btnText, { color: theme.onAccent }]}>
                Verify Phone
              </ThemedText>
            )}
          </HapticPressable>
          <HapticPressable onPress={sendOtp} style={styles.resend}>
            <ThemedText style={[styles.resendText, { color: theme.accent }]}>
              Resend code
            </ThemedText>
          </HapticPressable>
        </>
      )}

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefix: { fontSize: 16, fontWeight: '700', width: 36 },
  phoneInput: { flex: 1 },
  otpInput: { letterSpacing: 4, textAlign: 'center', fontSize: 20, fontWeight: '600' },
  btn: {
    paddingVertical: 14,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    marginTop: 8,
    minHeight: Layout.minTouch,
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  resend: { alignItems: 'center', paddingVertical: 8 },
  resendText: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 13, marginTop: 8 },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  verifiedText: { fontSize: 14, fontWeight: '600' },
});
