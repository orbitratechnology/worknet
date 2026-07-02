import { ThemedText } from '@/components/themed-text';
import { formFieldStyles } from '@/components/ui/form-section';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useFieldStyle,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
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
  onVerified: (phone: string) => void | Promise<void>;
}

export function PhoneVerifyStep({
  verified,
  phoneNumber,
  onVerified,
}: PhoneVerifyStepProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const surfaceStyle = useSurfaceStyle('soft');
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
    borderColor: error ? theme.error : theme.border,
    backgroundColor: theme.surface,
    ...fieldStyle,
  };

  const sendOtp = async () => {
    setError('');
    const e164 = normalizePhoneE164(phone);
    if (!isValidE164Phone(e164)) {
      setError('Enter a valid Sri Lankan mobile number.');
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
        e instanceof Error ? e.message : 'Could not send code. Try again.';
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
      await onVerified(normalizePhoneE164(phone));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid code';
      setError(`That code did not work. Check the SMS and try again. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <View
        style={[
          styles.verifiedRow,
          { backgroundColor: theme.muted, borderColor: theme.border },
          surfaceStyle,
        ]}>
        <Feather name='check-circle' size={20} color={theme.success} />
        <View style={styles.verifiedTextBlock}>
          <ThemedText style={[styles.verifiedTitle, { color: theme.success }]}>
            Phone verified
          </ThemedText>
          <ThemedText style={[styles.verifiedPhone, { color: theme.subtext }]}>
            {phoneNumber}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ThemedText style={formFieldStyles.label}>Mobile number</ThemedText>
      <View style={styles.phoneRow}>
        <View
          style={[
            styles.prefixBox,
            { backgroundColor: theme.muted, borderColor: theme.border },
            fieldStyle,
          ]}>
          <ThemedText style={[styles.prefix, { color: theme.text }]}>+94</ThemedText>
        </View>
        <TextInput
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            setError('');
          }}
          placeholder='77 123 4567'
          placeholderTextColor={theme.subtext}
          keyboardType='phone-pad'
          accessibilityLabel='Mobile phone number'
          style={[formFieldStyles.input, styles.phoneInput, inputStyle]}
        />
      </View>

      {!sent ? (
        <HapticPressable
          onPress={sendOtp}
          disabled={loading}
          style={({ pressed }) => [
            formFieldStyles.actionBtn,
            {
              backgroundColor: theme.accent,
              opacity: pressed || loading ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}>
          {loading ? (
            <ActivityIndicator color={theme.onAccent} />
          ) : (
            <ThemedText
              style={[formFieldStyles.actionBtnText, { color: theme.onAccent }]}>
              Send verification code
            </ThemedText>
          )}
        </HapticPressable>
      ) : (
        <>
          <ThemedText style={[formFieldStyles.label, styles.otpLabel]}>
            Enter the 6-digit code from SMS
          </ThemedText>
          <TextInput
            value={otp}
            onChangeText={(t) => {
              setOtp(t);
              setError('');
            }}
            keyboardType='number-pad'
            maxLength={6}
            placeholder='000000'
            placeholderTextColor={theme.subtext}
            accessibilityLabel='Verification code'
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
              formFieldStyles.actionBtn,
              {
                backgroundColor: theme.accent,
                opacity: pressed || loading || otp.length < 6 ? 0.5 : 1,
                transform: [{ scale: pressed && otp.length >= 6 ? 0.98 : 1 }],
              },
            ]}>
            {loading ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <ThemedText
                style={[formFieldStyles.actionBtnText, { color: theme.onAccent }]}>
                Verify phone
              </ThemedText>
            )}
          </HapticPressable>
          <HapticPressable
            onPress={sendOtp}
            style={({ pressed }) => [
              styles.resend,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText style={[styles.resendText, { color: theme.accent }]}>
              Did not get a code? Send again
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
  wrap: { width: '100%', gap: 4 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.itemGap,
    width: '100%',
  },
  prefixBox: {
    height: Layout.fieldHeight,
    minWidth: 56,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefix: { fontSize: 17, fontWeight: '700' },
  phoneInput: { flex: 1 },
  otpLabel: { marginTop: Layout.itemGap },
  otpInput: {
    letterSpacing: 6,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  resend: {
    alignItems: 'center',
    paddingVertical: Layout.itemGap,
    minHeight: Layout.minTouch,
    justifyContent: 'center',
  },
  resendText: { fontSize: 15, fontWeight: '600' },
  error: { fontSize: 14, marginTop: Layout.itemGap, lineHeight: 20 },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Layout.blockGap,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    width: '100%',
  },
  verifiedTextBlock: { flex: 1, gap: 2 },
  verifiedTitle: { fontSize: 15, fontWeight: '700' },
  verifiedPhone: { fontSize: 14 },
});
