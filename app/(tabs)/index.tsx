import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Problems } from '@/components/ui/problems';
import { ServiceCard } from '@/components/ui/service-card';
import { TopBar } from '@/components/ui/top-bar';
import { useLocation } from '@/context/location';
import { useServiceProviders } from '@/hooks/use-service-providers';
import { useTheme } from '@/hooks/use-theme';
import { calculateDistance } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

// ... (existing code, I'll just replace the relevant parts)
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { coords, country } = useLocation();
  const { providers: nearbyServices } = useServiceProviders({
    onlyAvailable: true,
    limitCount: 10,
  });

  const handleSearchPress = React.useCallback(() => {
    router.push('/explore');
  }, [router]);

  const renderHeader = React.useMemo(
    () => (
      <View style={styles.headerContent} collapsable={false}>
        <TopBar />

        {/* Search Call to Action */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.searchContainer}>
          <HapticPressable
            onPress={handleSearchPress}
            style={({ pressed }) => [
              styles.searchBar,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}>
            <Feather name='search' size={20} color={theme.accent} />
            <ThemedText style={[styles.searchText, { color: theme.subtext }]}>
              Search for &quot;Welder&quot; or &quot;Broken Tap&quot;...
            </ThemedText>
            <View
              style={[
                styles.searchBadge,
                { backgroundColor: theme.accent + '15' },
              ]}>
              <Feather name='sliders' size={14} color={theme.accent} />
            </View>
          </HapticPressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <Problems />
        </Animated.View>

        {/* <PromoBanner /> */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.nearbyHeader}>
          <ThemedText style={styles.nearbyTitle} type='subtitle' selectable>
            Nearby
          </ThemedText>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/services');
            }}>
            <ThemedText style={[styles.seeAll, { color: theme.accent }]}>
              See All
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    ),
    [theme, router, handleSearchPress],
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: ServiceProvider; index: number }) => {
      let displayDistance = 'Nearby';
      if (coords && item.location?.latitude && item.location?.longitude) {
        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          item.location.latitude,
          item.location.longitude,
        );
        displayDistance = dist < 1 ? 'Under 1km' : `${dist.toFixed(1)}km`;
      }

      return (
        <Animated.View
          style={{ flex: 1, maxWidth: '48%' }}
          entering={FadeInDown.delay(700 + index * 100).duration(600)}>
          <ServiceCard
            id={item.id}
            name={item.name}
            category={item.primaryProfession || 'General'}
            rating={item.rating || 0}
            distance={displayDistance}
            imageUrl={item.imageUrl || ''}
            isVerified={item.isVerified}
            experience={item.experienceYears}
            price={
              item.pricing?.baseRate
                ? `LKR ${item.pricing.baseRate}/hr`
                : undefined
            }
          />
        </Animated.View>
      );
    },
    [coords],
  );

  const keyExtractor = React.useCallback(
    (item: ServiceProvider) => item.id,
    [],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={nearbyServices}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          columnWrapperStyle={styles.columnWrapper}
          contentInsetAdjustmentBehavior='automatic'
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    paddingTop: 10,
  },
  searchContainer: {
    paddingHorizontal: 10,
    marginVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  searchBadge: {
    padding: 8,
    borderRadius: 10,
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  nearbyTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
