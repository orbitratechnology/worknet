import { Layout } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

export function TopBar() {
  const theme = useTheme();
  const { city, loading, refreshLocation } = useLocation();

  return (
    <View style={styles.container}>
      <View
        style={styles.logoWrap}
        accessibilityRole='image'
        accessibilityLabel='Worknet'>
        <Image
          source={require('@/assets/images/adaptive-icon.png')}
          style={styles.logoImage}
          contentFit='contain'
        />
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          refreshLocation();
        }}
        style={({ pressed }) => [
          styles.locationRow,
          { opacity: pressed ? 0.75 : 1 },
        ]}
        accessibilityRole='button'
        accessibilityLabel={
          loading ? 'Updating location' : `Location: ${city || 'Set location'}`
        }>
        {loading ? (
          <ActivityIndicator size='small' color={theme.text} />
        ) : (
          <>
            <Feather name='map-pin' size={16} color={theme.text} />
            <ThemedText
              style={styles.locationText}
              type='headline'
              numberOfLines={1}>
              {city || 'Set location'}
            </ThemedText>
            <Feather name='chevron-down' size={18} color={theme.text} />
          </>
        )}
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
    backgroundColor: 'transparent',
  },
  logoWrap: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: Layout.minTouch,
    maxWidth: '62%',
    flexShrink: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
});
