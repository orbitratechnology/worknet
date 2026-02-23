/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#000000'; // Elegant Black
const tintColorDark = '#FFFFFF'; // Pure White

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#404040',
    tabIconDefault: '#A3A3A3',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E5E5E5',
    subtext: '#666666',
    secondaryBackground: '#F8F9FA',
    accent: tintColorLight,
    shadow: '#000000',
    error: '#B91C1C',
    success: '#14532D',
    notification: '#B91C1C',
    surface: '#FFFFFF',
    gold: '#854D0E',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onGold: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: tintColorDark,
    icon: '#D4D4D4',
    tabIconDefault: '#404040',
    tabIconSelected: tintColorDark,
    card: '#0A0A0A',
    border: '#262626',
    subtext: '#A3A3A3',
    secondaryBackground: '#000000',
    accent: tintColorDark,
    shadow: '#000000',
    error: '#FEF2F2',
    success: '#DCFCE7',
    notification: '#FEF2F2',
    surface: '#0A0A0A',
    gold: '#FEF9C3',
    onAccent: '#000000',
    onError: '#000000',
    onSuccess: '#000000',
    onGold: '#000000',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
