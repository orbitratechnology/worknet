import {
  cardShadow,
  elevatedShadow,
  fieldBorderWidth,
  getFieldStyle,
  getSurfaceStyle,
  softShadow,
  type ColorScheme,
  type ShadowLevel,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColorSchemeMode(): ColorScheme {
  return (useColorScheme() ?? 'light') === 'dark' ? 'dark' : 'light';
}

export function useSurfaceStyle(level: ShadowLevel = 'card') {
  const scheme = useColorSchemeMode();
  return getSurfaceStyle(scheme, level);
}

export function useFieldStyle() {
  const scheme = useColorSchemeMode();
  return getFieldStyle(scheme);
}

export function useFieldBorderWidth() {
  return fieldBorderWidth(useColorSchemeMode());
}

export function useShadow(level: ShadowLevel = 'card') {
  const scheme = useColorSchemeMode();
  if (level === 'soft') return softShadow(scheme);
  if (level === 'elevated') return elevatedShadow(scheme);
  return cardShadow(scheme);
}
