import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type StackHeaderProps = {
  title: string;
  onBack?: () => void;
  backIcon?: 'arrow-left' | 'x';
  right?: React.ReactNode;
  border?: boolean;
};

export function StackHeader({
  title,
  onBack,
  backIcon = 'arrow-left',
  right,
  border = false,
}: StackHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        border && { borderBottomWidth: 1, borderBottomColor: theme.border },
      ]}>
      <Pressable
        onPress={handleBack}
        accessibilityRole='button'
        accessibilityLabel='Go back'
        hitSlop={8}
        style={({ pressed }) => [
          styles.sideBtn,
          { opacity: pressed ? 0.7 : 1 },
        ]}>
        <Feather name={backIcon} size={22} color={theme.text} />
      </Pressable>
      <ThemedText style={styles.title} numberOfLines={1} selectable>
        {title}
      </ThemedText>
      <View style={styles.sideBtn}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding - 4,
    paddingVertical: 8,
    minHeight: Layout.minTouch,
  },
  sideBtn: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
