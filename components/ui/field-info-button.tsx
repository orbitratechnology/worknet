import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

type FieldInfoButtonProps = {
  /** Shown in the alert body when the user taps the icon. */
  message: string;
  /** Alert title; defaults to "More info". */
  title?: string;
};

export function FieldInfoButton({ message, title = 'More info' }: FieldInfoButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(title, message);
      }}
      hitSlop={10}
      accessibilityRole='button'
      accessibilityLabel={`More information about ${title}`}
      style={({ pressed }) => [
        styles.btn,
        { opacity: pressed ? 0.65 : 1 },
      ]}>
      <Feather name='info' size={18} color={theme.subtext} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
