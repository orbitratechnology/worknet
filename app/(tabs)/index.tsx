import { ThemedText } from '@/components/themed-text';
import { HomeBanner } from '@/components/ui/home-banner';
import { Problems } from '@/components/ui/problems';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SearchField } from '@/components/ui/search-field';
import { SectionHeader } from '@/components/ui/section-header';
import { ServiceCard } from '@/components/ui/service-card';
import { TopBar } from '@/components/ui/top-bar';
import { Layout } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import {
  sortModeFromChip,
  useMatchedProviders,
} from '@/hooks/use-matched-providers';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

function formatProviderPrice(baseRate?: number) {
  return baseRate ? `LKR ${baseRate}/hr` : 'Contact for price';
}

export default function HomeScreen() {
  const router = useRouter();
  const { coords } = useLocation();
  const { contentBottom } = useScreenInsets({ tabBar: true });
  const { providers: nearbyServices, loading } = useMatchedProviders({
    coords,
    onlyAvailable: true,
    sortMode: sortModeFromChip('Best Match'),
    fetchLimit: 10,
    maxDistanceKm: 25,
  });

  const handleSearchPress = React.useCallback(() => {
    router.push('/(app)/explore');
  }, [router]);

  const renderNearbyCard = React.useCallback(
    (item: (typeof nearbyServices)[number]) => (
      <View style={styles.gridItem}>
        <ServiceCard
          id={item.id}
          name={item.name}
          role={item.primaryProfession || 'Worker'}
          distance={
            item.distance !== undefined
              ? item.distance < 1
                ? 'Under 1 km'
                : `${item.distance.toFixed(1)} km`
              : 'Nearby'
          }
          price={formatProviderPrice(item.pricing?.baseRate)}
          imageUrl={item.imageUrl || ''}
          availabilityStatus={item.availabilityStatus}
          rating={item.rating}
          reviewCount={item.reviewCount}
          matchReason={item.matchReason}
          showSave
        />
      </View>
    ),
    [],
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

            <HomeBanner />
            <Problems />

            <SectionHeader
              title='Nearby'
              onActionPress={() => router.push('/(tabs)/services')}
            />

            {loading ? (
              <ActivityIndicator style={{ marginVertical: 32 }} />
            ) : nearbyServices.length === 0 ? (
              <View style={styles.emptyNearby}>
                <ThemedText style={styles.emptyText} selectable>
                  No workers nearby yet. Try expanding your search.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.nearbyGrid}>
                {nearbyServices.slice(0, 6).map((item) => (
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
    paddingHorizontal: 10,
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
