import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSurfaceStyle } from '@/hooks/use-surface-style';
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
}: SocialAuthSectionProps) {
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle('soft');
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  return (
    <View style={styles.stack}>
      <Pressable
        style={({ pressed }) => [
          styles.stackBtn,
          { backgroundColor: theme.card, borderColor: theme.border },
          surfaceStyle,
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
    gap: 12,
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
    gap: 8,
    paddingVertical: 12,
  },
  gridBtnText: { fontSize: 14 },
  appleGridBtn: {
    flex: 1,
    height: Layout.inputHeight,
  },
});
