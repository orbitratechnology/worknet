import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface HapticPressableProps extends PressableProps {
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
}

/**
 * A reusable Pressable component that automatically triggers haptic feedback.
 * Helps maintain consistency across the app and reduces code duplication.
 */
export const HapticPressable: React.FC<HapticPressableProps> = ({
  children,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  onPress,
  ...props
}) => {
  const handlePress = (event: any) => {
    Haptics.impactAsync(hapticStyle);
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
};
