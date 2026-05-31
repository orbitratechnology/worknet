/**
 * Worknet design tokens — monochrome cream palette (Airbnb-inspired clarity).
 */

import { Platform } from 'react-native';

/** Warm cream canvas */
const cream = '#FAF7F2';
const creamMuted = '#F3EEE6';
const creamDeep = '#EBE4DA';

/** Ink hierarchy */
const ink = '#222222';
const inkMuted = '#717171';
const inkLight = '#B0B0B0';

const tintColorLight = ink;
const tintColorDark = '#FAFAFA';

export const Layout = {
  screenPadding: 20,
  sectionGap: 24,
  itemGap: 12,
  cardRadius: 20,
  chipRadius: 999,
  inputRadius: 999,
  inputHeight: 52,
  minTouch: 44,
  tabBarInset: 88,
} as const;

export type ColorScheme = 'light' | 'dark';

export const Colors = {
  light: {
    text: ink,
    background: cream,
    tint: tintColorLight,
    icon: inkMuted,
    tabIconDefault: inkLight,
    tabIconSelected: ink,
    card: '#FFFFFF',
    border: creamDeep,
    subtext: inkMuted,
    secondaryBackground: creamMuted,
    accent: ink,
    shadow: '#222222',
    error: '#C13515',
    success: '#008A05',
    online: '#008A05',
    offline: inkMuted,
    notification: '#C13515',
    surface: '#FFFFFF',
    gold: '#222222',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onGold: '#FFFFFF',
    muted: creamMuted,
    cream: cream,
    creamDeep: creamDeep,
    overlay: 'rgba(34, 34, 34, 0.72)',
  },
  dark: {
    text: '#F5F5F5',
    background: '#0A0A0A',
    tint: tintColorDark,
    icon: '#A3A3A3',
    tabIconDefault: '#737373',
    tabIconSelected: tintColorDark,
    card: '#171717',
    border: '#2A2A2A',
    subtext: '#A3A3A3',
    secondaryBackground: '#141414',
    accent: '#FAFAFA',
    shadow: '#000000',
    error: '#FF6B6B',
    success: '#4ADE80',
    online: '#4ADE80',
    offline: '#737373',
    notification: '#FF6B6B',
    surface: '#171717',
    gold: '#FAFAFA',
    onAccent: '#0A0A0A',
    onError: '#0A0A0A',
    onSuccess: '#0A0A0A',
    onGold: '#0A0A0A',
    muted: '#1F1F1F',
    cream: '#141414',
    creamDeep: '#2A2A2A',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
};

export function cardShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? '0 6px 20px rgba(34, 34, 34, 0.08)'
    : '0 6px 20px rgba(0, 0, 0, 0.45)';
}

export function elevatedShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? '0 12px 32px rgba(34, 34, 34, 0.12)'
    : '0 12px 32px rgba(0, 0, 0, 0.55)';
}

export function softShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? '0 2px 8px rgba(34, 34, 34, 0.06)'
    : '0 2px 8px rgba(0, 0, 0, 0.35)';
}

export const Typography = {
  largeTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  callout: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
