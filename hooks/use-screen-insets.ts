import { Layout } from '@/constants/theme';
import { resolveBottomInset, resolveTopInset } from '@/lib/safe-area';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenInsetsOptions = {
  tabBar?: boolean;
};

export function useScreenInsets(options?: ScreenInsetsOptions) {
  const insets = useSafeAreaInsets();
  const top = resolveTopInset(insets.top);
  const bottom = resolveBottomInset(insets.bottom);

  return {
    top,
    left: insets.left,
    right: insets.right,
    bottom,
    contentBottom: bottom + (options?.tabBar ? Layout.tabBarInset : 0),
  };
}
