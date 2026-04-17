import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { Feather, FontAwesome } from '@expo/vector-icons';
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
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

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
      setError(
        err.message || 'Failed to sign in. Please check your credentials.',
      );
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
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            contentInsetAdjustmentBehavior='automatic'>
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
                  { backgroundColor: theme.accent },
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
            <View style={styles.socialContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleGoogleLogin}
                disabled={loading}>
                <FontAwesome name='google' size={20} color={theme.text} />
                <ThemedText style={styles.socialBtnText} type='defaultSemiBold'>
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </ThemedText>
              </Pressable>

              {/* <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }>
                <FontAwesome name='apple' size={20} color={theme.onAccent} />
                <ThemedText
                  style={[styles.socialBtnText, { color: theme.onAccent }]}
                  type='defaultSemiBold'>
                  Continue with Apple
                </ThemedText>
              </Pressable> */}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
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
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    height: 56,
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
    height: 56,
    borderRadius: 16,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
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
    height: 56,
    borderRadius: 16,
    borderCurve: 'continuous',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  socialBtnText: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
  },
});
