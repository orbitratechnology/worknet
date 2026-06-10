import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isAppleSignInAvailable } from '@/lib/apple-auth';
import { FontAwesome } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

type SocialAuthSectionProps = {
  loading: boolean;
  onGooglePress: () => void;
  onApplePress: () => void;
  variant?: 'stack' | 'grid';
};

export function SocialAuthSection({
  loading,
  onGooglePress,
  onApplePress,
  variant = 'stack',
}: SocialAuthSectionProps) {
  const theme = useTheme();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const googleButton =
    variant === 'stack' ? (
      <Pressable
        style={({ pressed }) => [
          styles.stackBtn,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onGooglePress();
        }}
        disabled={loading}>
        <FontAwesome name='google' size={20} color={theme.text} />
        <ThemedText style={styles.stackBtnText} type='defaultSemiBold'>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </ThemedText>
      </Pressable>
    ) : (
      <Pressable
        style={({ pressed }) => [
          styles.gridBtn,
          { backgroundColor: theme.card, borderColor: theme.border },
          loading && { opacity: 0.8 },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onGooglePress();
        }}
        disabled={loading}>
        <FontAwesome name='google' size={24} color='#EA4335' />
        <ThemedText style={styles.gridBtnText} type='defaultSemiBold'>
          {loading ? '...' : 'Google'}
        </ThemedText>
      </Pressable>
    );

  const appleButton =
    Platform.OS === 'ios' && appleAvailable ? (
      variant === 'stack' ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={Layout.chipRadius}
          style={styles.appleStackBtn}
          onPress={() => {
            if (loading) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onApplePress();
          }}
        />
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={Layout.chipRadius}
          style={styles.appleGridBtn}
          onPress={() => {
            if (loading) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onApplePress();
          }}
        />
      )
    ) : null;

  if (variant === 'grid') {
    return (
      <View style={styles.gridRow}>
        {googleButton}
        {appleButton}
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {googleButton}
      {appleButton}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  stackBtn: {
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
  stackBtnText: { fontSize: 15 },
  appleStackBtn: {
    width: '100%',
    height: Layout.inputHeight,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridBtn: {
    flex: 1,
    minHeight: Layout.inputHeight,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
    paddingVertical: 12,
  },
  gridBtnText: { fontSize: 14 },
  appleGridBtn: {
    flex: 1,
    height: Layout.inputHeight,
  },
});
