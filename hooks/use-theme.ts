import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

/**
 * A hook that returns the entire theme object based on the current color scheme.
 * This is more convenient than using useColorScheme and mapping it to Colors manually
 * in every component.
 */
export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}
