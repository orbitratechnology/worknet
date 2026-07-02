/**
 * Worknet design tokens — clean white light mode, shadow-based elevation.
 */

import { Platform, StyleSheet } from 'react-native';

/** Light mode neutrals */
const white = '#FFFFFF';
const gray50 = '#F7F7F7';
const gray100 = '#F0F0F0';
const gray200 = '#E5E5E5';

/** Ink hierarchy */
const ink = '#222233';
const inkMuted = '#717171';
const inkLight = '#B0B0B0';

const tintColorLight = ink;
const tintColorDark = '#FAFAFA';

export const Layout = {
  screenPadding: 20,
  /** Space between major home / screen sections */
  sectionGap: 28,
  /** Space between related blocks inside a section */
  blockGap: 16,
  /** Space between form sections in wizards */
  formSectionGap: 24,
  /** Space between fields inside one form section */
  fieldGap: 14,
  /** Space between list items, grid cells, chips */
  itemGap: 12,
  cardRadius: 16,
  chipRadius: 999,
  /** Pill radius for search bars and primary CTAs */
  inputRadius: 999,
  /** Standard text field corner radius */
  fieldRadius: 12,
  inputHeight: 52,
  /** Taller fields for onboarding — easier to tap and read */
  fieldHeight: 56,
  minTouch: 48,
  tabBarInset: 88,
} as const;

export type ColorScheme = 'light' | 'dark';

export const Colors = {
  light: {
    text: ink,
    background: white,
    tint: tintColorLight,
    icon: inkMuted,
    tabIconDefault: inkLight,
    tabIconSelected: ink,
    card: white,
    border: 'transparent',
    divider: gray100,
    subtext: inkMuted,
    secondaryBackground: gray50,
    accent: ink,
    shadow: '#222222',
    error: '#C13515',
    success: '#008A05',
    online: '#008A05',
    offline: inkMuted,
    notification: '#C13515',
    surface: white,
    gold: '#222222',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onGold: '#FFFFFF',
    muted: gray50,
    cream: white,
    creamDeep: gray200,
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
    divider: '#2A2A2A',
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

export type ShadowLevel = 'soft' | 'card' | 'elevated';

export function shadowForLevel(scheme: ColorScheme, level: ShadowLevel) {
  if (level === 'soft') return softShadow(scheme);
  if (level === 'elevated') return elevatedShadow(scheme);
  return cardShadow(scheme);
}

export function cardShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? '0 4px 16px rgba(34, 34, 34, 0.10)'
    : '0 6px 20px rgba(0, 0, 0, 0.45)';
}

export function elevatedShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? '0 8px 28px rgba(34, 34, 34, 0.14)'
    : '0 12px 32px rgba(0, 0, 0, 0.55)';
}

export function softShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? '0 2px 10px rgba(34, 34, 34, 0.08)'
    : '0 2px 8px rgba(0, 0, 0, 0.35)';
}

export function surfaceBorderWidth(scheme: ColorScheme) {
  return scheme === 'light' ? 0 : StyleSheet.hairlineWidth;
}

export function fieldBorderWidth(scheme: ColorScheme) {
  return scheme === 'light' ? 0 : 1.5;
}

export function chipBorderWidth(scheme: ColorScheme, selected?: boolean) {
  if (scheme === 'light') return 0;
  return selected ? 2 : 1.5;
}

export function getSurfaceStyle(scheme: ColorScheme, level: ShadowLevel = 'card') {
  return {
    borderWidth: surfaceBorderWidth(scheme),
    boxShadow: shadowForLevel(scheme, level),
  };
}

export function getFieldStyle(scheme: ColorScheme) {
  return {
    borderWidth: fieldBorderWidth(scheme),
    boxShadow: scheme === 'light' ? softShadow(scheme) : undefined,
  };
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
