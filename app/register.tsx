import { SocialAuthSection } from '@/components/auth/social-auth-section';
import { LegalAgreement } from '@/components/legal/legal-agreement';
import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/ui/screen-shell';
import { StackHeader } from '@/components/ui/stack-header';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useFieldStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { Feather } from '@expo/vector-icons';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const { contentBottom } = useScreenInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signUp(email, password, fullName);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message !== 'Sign-in cancelled') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithApple();
    } catch (err: any) {
      if (err.message !== 'Sign-in cancelled') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell>
      <StackHeader title='Sign Up' />

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
            <Image
              source={require('@/assets/images/adaptive-icon.png')}
              style={styles.logo}
              contentFit='contain'
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <ThemedText style={styles.title} type='title'>
              Create Account
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
              Join Worknet to find trusted help or earn money in Sri Lanka.
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type='defaultSemiBold'>
                Full Name
              </ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder='e.g. John Perera'
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
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Feather
                  name='user'
                  size={18}
                  color={theme.subtext}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type='defaultSemiBold'>
                Email Address
              </ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder='name@example.com'
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
                />
                <Feather
                  name='mail'
                  size={18}
                  color={theme.subtext}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type='defaultSemiBold'>
                Password
              </ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder='At least 8 characters'
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
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  style={({ pressed }) => [styles.eyeIcon, { opacity: 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPassword(!showPassword);
                  }}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={theme.subtext}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type='defaultSemiBold'>
                Confirm Password
              </ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder='Re-enter password'
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  style={({ pressed }) => [styles.eyeIcon, { opacity: 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowConfirmPassword(!showConfirmPassword);
                  }}>
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={theme.subtext}
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <ThemedText
                style={[
                  styles.errorText,
                  { color: theme.error, marginTop: 10 },
                ]}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.createBtn,
                { backgroundColor: theme.accent },
                loading && { opacity: 0.8 },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleRegister}
              disabled={loading}>
              <ThemedText
                style={[styles.createBtnText, { color: theme.onAccent }]}
                type='defaultSemiBold'>
                {loading ? 'Creating Account...' : 'Create Account'}
              </ThemedText>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <ThemedText style={[styles.dividerText, { color: theme.subtext }]}>
              Or continue with
            </ThemedText>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          </View>

          <SocialAuthSection
            loading={loading}
            onGooglePress={handleGoogleRegister}
            onApplePress={handleAppleRegister}
            variant='stack'
          />
          <LegalAgreement />

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.signUpRow}>
              <ThemedText style={{ color: theme.subtext }}>
                Already have an account?{' '}
              </ThemedText>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/login');
                }}>
                <ThemedText
                  style={[styles.logInText, { color: theme.accent }]}
                  type='defaultSemiBold'>
                  Log In
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Layout.screenPadding + 4,
    paddingTop: 16,
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    height: Layout.inputHeight + 4,
    fontSize: 15,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  createBtn: {
    height: Layout.inputHeight + 4,
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  createBtnText: {
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialSquare: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  socialSquareText: {
    fontSize: 15,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  signUpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInText: {
    fontSize: 15,
  },
});
