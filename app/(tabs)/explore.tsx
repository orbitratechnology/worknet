import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <LinearGradient
            colors={[theme.accent + '20', theme.accent + '05']}
            style={styles.iconContainer}>
            <MaterialCommunityIcons
              name='map-marker-radius-outline'
              size={60}
              color={theme.accent}
            />
          </LinearGradient>

          <ThemedText type='title' style={styles.title}>
            Interactive Maps
          </ThemedText>
          <ThemedText style={[styles.description, { color: theme.subtext }]}>
            Soon you&apos;ll be able to discover and visualize trusted local
            talent right in your neighborhood.
          </ThemedText>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.notifButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <Feather name='bell' size={18} color={theme.accent} />
            <ThemedText style={[styles.notifText, { color: theme.text }]}>
              Notify me when ready
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Decorative background elements */}
      <View
        style={[
          styles.blob,
          {
            backgroundColor: theme.accent,
            opacity: 0.03,
            top: -50,
            right: -50,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: theme.accent,
            opacity: 0.05,
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
          },
        ]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  notifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
  },
  notifText: {
    fontSize: 15,
    fontWeight: '700',
  },
  blob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
  },
});
