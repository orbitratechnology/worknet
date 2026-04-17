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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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
      setError(err.message || 'Failed to create account.');
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
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => [styles.backBtn, { opacity: 1 }]}>
            <Feather name='chevron-left' size={28} color={theme.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle} type='defaultSemiBold'>
            Sign Up
          </ThemedText>
          <View style={styles.backBtn} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            contentInsetAdjustmentBehavior='automatic'>
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
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <ThemedText
                style={[styles.dividerText, { color: theme.subtext }]}>
                Or continue with
              </ThemedText>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
            </View>

            {/* Social Icons Grid */}
            <View style={styles.socialRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.socialSquare,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  loading && { opacity: 0.8 },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleGoogleRegister}
                disabled={loading}>
                <FontAwesome name='google' size={24} color='#EA4335' />
                <ThemedText
                  style={styles.socialSquareText}
                  type='defaultSemiBold'>
                  {loading ? '...' : 'Google'}
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.socialSquare,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }>
                <FontAwesome name='apple' size={24} color={theme.onAccent} />
                <ThemedText
                  style={[styles.socialSquareText, { color: theme.onAccent }]}
                  type='defaultSemiBold'>
                  Apple
                </ThemedText>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={{ color: theme.subtext }}>
                Already have an account?{' '}
              </ThemedText>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/login');
                }}
                style={({ pressed }) => [{ opacity: 1 }]}>
                <ThemedText
                  style={[styles.logInText, { color: theme.accent }]}
                  type='defaultSemiBold'>
                  Log In
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 56,
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
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
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 16, // Will adjust if icon is present
    height: 56,
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
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    borderWidth: 1,
    gap: 12,
  },
  socialSquareText: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    alignItems: 'center',
  },
  logInText: {
    fontSize: 15,
  },
});
