import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';

export function PromoBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#333333']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.banner, { shadowColor: theme.shadow }]}>
        <View style={styles.content}>
          <View
            style={[styles.badge, { backgroundColor: theme.accent + '30' }]}>
            <ThemedText style={[styles.badgeText, { color: '#FFFFFF' }]}>
              Limited Offer
            </ThemedText>
          </View>
          <ThemedText style={styles.title}>
            Get 10% off your first booking
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Use code: <ThemedText style={styles.code}>WORKNET10</ThemedText>
          </ThemedText>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: '#FFFFFF' }]}>
          <Feather name='arrow-right' size={20} color='#000000' />
        </TouchableOpacity>

        {/* Decorative elements */}
        <View
          style={[
            styles.circle1,
            { backgroundColor: '#FFFFFF', opacity: 0.05 },
          ]}
        />
        <View
          style={[
            styles.circle2,
            { backgroundColor: '#FFFFFF', opacity: 0.05 },
          ]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  banner: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 26,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  code: {
    color: '#FFF',
    fontWeight: '800',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  circle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    left: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
