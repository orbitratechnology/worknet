import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
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
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordResetEmail } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

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
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { opacity: 1 }]}>
            <Feather name='arrow-left' size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoTile}>
              <Image
                source={require('@/assets/images/adaptive-icon.png')}
                style={styles.logoImage}
                contentFit='contain'
              />
            </View>
            <ThemedText style={styles.title} type='title'>
              Reset Password
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
              {success
                ? 'Check your email for instructions to reset your password.'
                : "Enter your email address and we'll send you a link to reset your password."}
            </ThemedText>
          </View>

          {!success ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.form}>
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
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
              </View>

              {error ? (
                <ThemedText style={[styles.errorText, { color: theme.error }]}>
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
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.successSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.backToLoginBtn,
                  { borderColor: theme.border },
                ]}
                onPress={() => router.replace('/login')}>
                <ThemedText
                  style={styles.backToLoginText}
                  type='defaultSemiBold'>
                  Back to Login
                </ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  form: {
    gap: 24,
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
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resetBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtnText: {
    fontSize: 16,
  },
  successSection: {
    alignItems: 'center',
  },
  backToLoginBtn: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
  },
});
