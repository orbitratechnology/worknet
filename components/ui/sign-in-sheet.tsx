import {
  BottomSheetHeader,
  BottomSheetHero,
} from '@/components/ui/bottom-sheet-header';
import { Layout } from '@/constants/theme';
import { useFieldStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { AppBottomSheet } from './app-bottom-sheet';

interface SignInSheetHostProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  message: string;
  returnPath?: string;
  router: ReturnType<typeof useRouter>;
}

export function SignInSheetHost({
  sheetRef,
  message,
  returnPath,
  router,
}: SignInSheetHostProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();

  const goLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.dismiss();
    router.push({
      pathname: '/login',
      params: { message, returnTo: returnPath ?? '' },
    });
  };

  const goRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.dismiss();
    router.push('/register');
  };

  return (
    <AppBottomSheet ref={sheetRef} snapPoints={['48%']}>
      <View style={styles.container}>
        <BottomSheetHeader title='Sign in required' />
        <BottomSheetHero
          icon='user'
          title={message}
          subtitle='Save workers, leave reviews, or become a worker on Worknet.'
        />

        <Pressable
          onPress={goLogin}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 },
          ]}>
          <ThemedText style={[styles.primaryBtnText, { color: theme.onAccent }]}>
            Sign In
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={goRegister}
          style={({ pressed }) => [
            styles.secondaryBtn,
            fieldStyle,
            {
              backgroundColor: theme.surface,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <ThemedText style={styles.secondaryBtnText}>Create Account</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText style={[styles.dismiss, { color: theme.subtext }]}>
            Continue browsing
          </ThemedText>
        </Pressable>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: Layout.minTouch + 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: Layout.minTouch + 8,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dismiss: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
