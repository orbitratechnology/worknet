import { ThemedText } from '@/components/themed-text';
import { cardShadow, Layout, type ColorScheme } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const DISMISS_KEY = 'worknet_banner_dismissed';

type BannerVariant = 'guest' | 'becomeWorker' | 'goOnline' | null;

export function HomeBanner() {
  const theme = useTheme();
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [providerOffline, setProviderOffline] = useState(false);

  const isWorker = !!userProfile?.isServiceProvider;

  useEffect(() => {
    AsyncStorage.getItem(DISMISS_KEY).then((val) => {
      setDismissed(val === '1');
    });
  }, []);

  const variant: BannerVariant = React.useMemo(() => {
    if (dismissed) return null;
    if (!user) return 'guest';
    if (!isWorker) return 'becomeWorker';
    if (providerOffline) return 'goOnline';
    return null;
  }, [dismissed, user, isWorker, providerOffline]);

  const dismiss = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/(tabs)/offer-service');
  }, [user, router]);

  if (!variant) return null;

  const config = {
    guest: {
      title: 'Sign in to save workers',
      subtitle: 'Create a free account to save favourites and leave reviews.',
      cta: 'Sign In',
      icon: 'account-outline' as const,
    },
    becomeWorker: {
      title: 'Become a Worker',
      subtitle: 'Offer your skills locally and get discovered on Worknet.',
      cta: 'Get Started',
      icon: 'briefcase-outline' as const,
    },
    goOnline: {
      title: "You're hidden from search",
      subtitle: 'Go online on your Worker dashboard to appear in results.',
      cta: 'Go Online',
      icon: 'eye-off-outline' as const,
    },
  }[variant];

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.banner,
          {
            backgroundColor: theme.card,
            boxShadow: cardShadow(colorScheme),
            opacity: pressed ? 0.92 : 1,
          },
        ]}>
        <View style={[styles.iconBox, { backgroundColor: theme.text }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={22}
            color={theme.onAccent}
          />
        </View>
        <View style={styles.textCol}>
          <ThemedText style={styles.title} type='defaultSemiBold'>
            {config.title}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
            {config.subtitle}
          </ThemedText>
        </View>
        <Feather name='chevron-right' size={18} color={theme.subtext} />
      </Pressable>
      <Pressable onPress={dismiss} style={styles.dismissBtn} hitSlop={8}>
        <Feather name='x' size={16} color={theme.subtext} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap - 8,
    position: 'relative',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, marginBottom: 2, letterSpacing: -0.2 },
  subtitle: { fontSize: 12, lineHeight: 16 },
  dismissBtn: {
    position: 'absolute',
    top: 6,
    right: Layout.screenPadding + 4,
    padding: 4,
  },
});
