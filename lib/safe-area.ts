import Constants from 'expo-constants';
import { Platform, StatusBar } from 'react-native';

const MIN_TOP_INSET = Platform.OS === 'android' ? 48 : 24;

export function getStatusBarFallback(): number {
  return Math.max(
    Constants.statusBarHeight ?? 0,
    StatusBar.currentHeight ?? 0,
    MIN_TOP_INSET,
  );
}

export function resolveTopInset(insetTop: number): number {
  return Math.max(insetTop, getStatusBarFallback());
}

export function resolveBottomInset(insetBottom: number): number {
  return insetBottom;
}
