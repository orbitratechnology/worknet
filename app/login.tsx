import { SocialAuthSection } from '@/components/auth/social-auth-section';
import { LegalAgreement } from '@/components/legal/legal-agreement';
import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function LoginScreen() {
  const router = useRouter();
  const { message: redirectMessage } = useLocalSearchParams<{
    message?: string;
    returnTo?: string;
  }>();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const theme = useTheme();
  const { contentBottom } = useScreenInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signIn(email, password);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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

  const handleAppleLogin = async () => {
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
    <ScreenShell safeBottom>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottom + 24 },
          ]}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoTile}>
              <Image
                source={require('@/assets/images/adaptive-icon.png')}
                style={styles.logoImage}
                contentFit='contain'
              />
            </View>
            <View>
              <ThemedText style={styles.welcomeTitle} type='title'>
                Welcome Back
              </ThemedText>
              <ThemedText
                style={[styles.welcomeSubtitle, { color: theme.subtext }]}>
                Connecting you with trusted pros across Sri Lanka.
              </ThemedText>
            </View>
          </View>

          {redirectMessage ? (
            <View
              style={[
                styles.messageBanner,
                { backgroundColor: theme.accent + '15', borderColor: theme.accent },
              ]}>
              <ThemedText style={[styles.messageBannerText, { color: theme.accent }]}>
                {redirectMessage}
              </ThemedText>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type='defaultSemiBold'>
                Email
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
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type='defaultSemiBold'>
                Password
              </ThemedText>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder='Enter your password'
                  placeholderTextColor={theme.subtext}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPassword(!showPassword);
                  }}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.subtext}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.forgotBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/forgot-password');
              }}>
              <ThemedText
                style={[styles.forgotText, { color: theme.accent }]}>
                Forgot Password?
              </ThemedText>
            </Pressable>

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
                styles.loginBtn,
                { backgroundColor: theme.text },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleLogin}
              disabled={loading}>
              <ThemedText
                style={[styles.loginBtnText, { color: theme.onAccent }]}
                type='defaultSemiBold'>
                {loading ? 'Logging in...' : 'Log in'}
              </ThemedText>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View
              style={[styles.divider, { backgroundColor: theme.border }]}
            />
            <ThemedText
              style={[styles.dividerText, { color: theme.subtext }]}>
              OR
            </ThemedText>
            <View
              style={[styles.divider, { backgroundColor: theme.border }]}
            />
          </View>

          {/* Social Buttons */}
          <SocialAuthSection
            loading={loading}
            onGooglePress={handleGoogleLogin}
            onApplePress={handleAppleLogin}
            variant='stack'
          />
          <LegalAgreement />

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(tabs)');
              }}
              style={styles.browseLink}>
              <ThemedText
                style={[styles.browseLinkText, { color: theme.subtext }]}
                type='defaultSemiBold'>
                Continue browsing without signing in
              </ThemedText>
            </Pressable>
            <View style={styles.signUpRow}>
              <ThemedText style={{ color: theme.subtext }}>
                Don&apos;t have an account?{' '}
              </ThemedText>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/register');
                }}>
                <ThemedText
                  style={[styles.signUpText, { color: theme.accent }]}
                  type='defaultSemiBold'>
                  Sign Up
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
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTile: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  welcomeTitle: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  messageBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  messageBannerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
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
  input: {
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    height: Layout.inputHeight,
    fontSize: 16,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginBtn: {
    height: Layout.inputHeight,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    boxShadow: '0px 6px 16px rgba(34, 34, 34, 0.15)',
  },
  loginBtnText: {
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
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    gap: 16,
  },
  socialBtn: {
    height: Layout.inputHeight,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(34, 34, 34, 0.06)',
  },
  socialBtnText: {
    fontSize: 15,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  browseLink: {
    paddingVertical: 8,
  },
  browseLinkText: {
    fontSize: 15,
    textAlign: 'center',
  },
  signUpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
  },
});
