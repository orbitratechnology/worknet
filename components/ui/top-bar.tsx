import { Layout, Typography } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

export function TopBar() {
  const theme = useTheme();
  const { city, loading, refreshLocation } = useLocation();

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={[styles.logoWrap, { backgroundColor: theme.card }]}>
          <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={styles.logoImage}
            contentFit='contain'
          />
        </View>
        <View style={styles.greetingBlock}>
          <ThemedText style={[styles.eyebrow, { color: theme.subtext }]}>
            Discover pros near
          </ThemedText>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              refreshLocation();
            }}
            style={({ pressed }) => [
              styles.locationRow,
              { opacity: pressed ? 0.75 : 1 },
            ]}>
            {loading ? (
              <ActivityIndicator size='small' color={theme.text} />
            ) : (
              <>
                <ThemedText style={styles.locationText} type='headline'>
                  {city || 'Set location'}
                </ThemedText>
                <Feather name='chevron-down' size={18} color={theme.text} />
              </>
            )}
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: pressed ? 0.88 : 1,
          },
        ]}>
        <Feather name='bell' size={20} color={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  greetingBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...Typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: Layout.minTouch,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  iconButton: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    borderRadius: Layout.minTouch / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
});
