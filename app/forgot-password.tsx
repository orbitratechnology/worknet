import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import {
  useFieldStyle,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordResetEmail } = useAuth();
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const surfaceStyle = useSurfaceStyle('soft');
  const { contentBottom } = useScreenInsets();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await sendPasswordResetEmail(email);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell>
      <StackHeader title='Reset Password' />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottom + 24 },
          ]}>
          <View style={styles.logoSection}>
            <View style={styles.logoTile}>
              <Image
                source={require('@/assets/images/adaptive-icon.png')}
                style={styles.logoImage}
                contentFit='contain'
              />
            </View>
            <ThemedText style={styles.title} type='title' selectable>
              {success ? 'Check your email' : 'Forgot password?'}
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: theme.subtext }]}
              selectable>
              {success
                ? 'We sent instructions to reset your password.'
                : "Enter your email and we'll send you a reset link."}
            </ThemedText>
          </View>

          {!success ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label} type='defaultSemiBold'>
                  Email Address
                </ThemedText>
                <TextInput
                  placeholder='Enter your email'
                  placeholderTextColor={theme.subtext}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                    fieldStyle,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  textContentType='emailAddress'
                />
              </View>

              {error ? (
                <ThemedText
                  style={[styles.errorText, { color: theme.error }]}
                  selectable>
                  {error}
                </ThemedText>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.resetBtn,
                  { backgroundColor: theme.accent },
                  loading && { opacity: 0.8 },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleResetPassword}
                disabled={loading}>
                <ThemedText
                  style={[styles.resetBtnText, { color: theme.onAccent }]}
                  type='defaultSemiBold'>
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.backToLoginBtn,
                {
                  borderColor: theme.border,
                  opacity: pressed ? 0.9 : 1,
                },
                surfaceStyle,
              ]}
              onPress={() => router.replace('/login')}>
              <ThemedText style={styles.backToLoginText} type='defaultSemiBold'>
                Back to Login
              </ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Layout.screenPadding + 4,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTile: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  logoImage: { width: 96, height: 96 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14 },
  input: {
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    height: Layout.inputHeight + 4,
    fontSize: 16,
  },
  errorText: { fontSize: 14, textAlign: 'center' },
  resetBtn: {
    height: Layout.inputHeight + 4,
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtnText: { fontSize: 16 },
  backToLoginBtn: {
    height: Layout.inputHeight + 4,
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: { fontSize: 16 },
});
