import { Colors } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

export function TopBar() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { city, loading, refreshLocation } = useLocation();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoAndLocation}>
        <View style={[styles.logoSmall]}>
          <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={styles.logoSmallImage}
            contentFit='contain'
          />
        </View>
        <View style={styles.leftSection}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={refreshLocation}
            style={styles.locationSelector}>
            <Feather name='map-pin' size={14} color={theme.accent} />
            {loading ? (
              <ActivityIndicator size='small' color={theme.accent} />
            ) : (
              <ThemedText style={styles.locationText} type='defaultSemiBold'>
                {city || 'Pick Location'}
              </ThemedText>
            )}
            <Feather name='refresh-cw' size={14} color={theme.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.iconButton, { backgroundColor: theme.surface }]}>
          <Feather name='bell' size={20} color={theme.text} />
          <View
            style={[
              styles.notificationBadge,
              {
                backgroundColor: theme.accent,
                borderColor: theme.background,
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  logoAndLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoSmall: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoSmallImage: {
    width: 40,
    height: 40,
  },
  leftSection: {
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
});
