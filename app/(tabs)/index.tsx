import { ThemedText } from '@/components/themed-text';
import { Problems } from '@/components/ui/problems';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SearchField } from '@/components/ui/search-field';
import { SectionHeader } from '@/components/ui/section-header';
import { ServiceCard } from '@/components/ui/service-card';
import { TopBar } from '@/components/ui/top-bar';
import { Layout } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useServiceProviders } from '@/hooks/use-service-providers';
import { calculateDistance } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

function formatProviderPrice(item: ServiceProvider) {
  return item.pricing?.baseRate
    ? `LKR ${item.pricing.baseRate}/hr`
    : 'Contact for price';
}

function formatProviderDistance(
  item: ServiceProvider,
  coords: { latitude: number; longitude: number } | null,
) {
  if (!coords || !item.location?.latitude || !item.location?.longitude) {
    return 'Nearby';
  }
  const dist = calculateDistance(
    coords.latitude,
    coords.longitude,
    item.location.latitude,
    item.location.longitude,
  );
  return dist < 1 ? 'Under 1 km' : `${dist.toFixed(1)} km`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { coords } = useLocation();
  const { contentBottom } = useScreenInsets({ tabBar: true });
  const { providers: nearbyServices } = useServiceProviders({
    onlyAvailable: true,
    limitCount: 10,
  });

  const handleSearchPress = React.useCallback(() => {
    router.push('/(app)/explore');
  }, [router]);

  const renderNearbyCard = React.useCallback(
    (item: ServiceProvider) => (
      <View style={styles.gridItem}>
        <ServiceCard
          id={item.id}
          name={item.name}
          role={item.primaryProfession || 'General'}
          distance={formatProviderDistance(item, coords)}
          price={formatProviderPrice(item)}
          imageUrl={item.imageUrl || ''}
          availabilityStatus={item.availabilityStatus}
          rating={item.rating}
          reviewCount={item.reviewCount}
          isVerified={item.isVerified}
        />
      </View>
    ),
    [coords],
  );

  return (
    <ScreenShell>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <TopBar />

            <View style={styles.searchContainer}>
              <SearchField
                placeholder='Search for "Welder" or "Broken Tap"...'
                onPress={handleSearchPress}
                editable={false}
                showFilter
                onFilterPress={() => router.push('/(tabs)/services')}
              />
            </View>

            <Problems />

            <SectionHeader
              title='Nearby'
              onActionPress={() => router.push('/(tabs)/services')}
            />

            {nearbyServices.length === 0 ? (
              <View style={styles.emptyNearby}>
                <ThemedText style={styles.emptyText} selectable>
                  No providers nearby yet. Try expanding your search.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.nearbyGrid}>
                {nearbyServices.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderNearbyCard(item)}
                  </React.Fragment>
                ))}
              </View>
            )}
          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottom },
        ]}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap,
  },
  nearbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.itemGap,
  },
  gridItem: {
    width: '48%',
    maxWidth: '48%',
  },
  emptyNearby: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
  scrollContent: {},
});
