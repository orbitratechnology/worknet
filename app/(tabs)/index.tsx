import { HomeBanner } from '@/components/ui/home-banner';
import { HomeWorkerSection } from '@/components/ui/home-worker-section';
import { NearbyEmptyState } from '@/components/ui/nearby-empty-state';
import { EmergencyProblems, PopularServices } from '@/components/ui/problems';
import { RadiusSelector } from '@/components/ui/radius-selector';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SearchField } from '@/components/ui/search-field';
import { SectionHeader } from '@/components/ui/section-header';
import { TopBar } from '@/components/ui/top-bar';
import { getNextRadiusKm } from '@/constants/search-defaults';
import { Layout } from '@/constants/theme';
import { useSearchLocation } from '@/context/search-location';
import { useMatchedProviders } from '@/hooks/use-matched-providers';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { suggestFallbackArea } from '@/lib/search-areas';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

const SECTION_FETCH_LIMIT = 8;
const NEARBY_FETCH_LIMIT = 6;

export default function HomeScreen() {
  const router = useRouter();
  const { coords, radiusKm, searchOrigin, setRadiusKm, setSearchOrigin } =
    useSearchLocation();
  const { contentBottom } = useScreenInsets({ tabBar: true });

  const geoOptions = {
    coords,
    maxDistanceKm: radiusKm,
  };

  const { providers: topWorkers, loading: topLoading } = useMatchedProviders({
    ...geoOptions,
    sortMode: 'topRated',
    minRating: 4,
    fetchLimit: SECTION_FETCH_LIMIT,
  });

  const { providers: emergencyReady, loading: emergencyLoading } =
    useMatchedProviders({
      ...geoOptions,
      emergencyOnly: true,
      sortMode: 'available',
      fetchLimit: SECTION_FETCH_LIMIT,
    });

  const { providers: newlyJoined, loading: newLoading } = useMatchedProviders({
    ...geoOptions,
    sortMode: 'newest',
    fetchLimit: SECTION_FETCH_LIMIT,
  });

  const { providers: nearbyServices, loading: nearbyLoading } =
    useMatchedProviders({
      ...geoOptions,
      onlyAvailable: true,
      sortMode: 'best',
      fetchLimit: NEARBY_FETCH_LIMIT,
    });

  const searchLabel = searchOrigin?.label ?? 'your area';

  const fallbackArea = useMemo(() => {
    if (!coords || nearbyServices.length > 0) return null;
    return suggestFallbackArea(coords.latitude, coords.longitude, searchLabel);
  }, [coords, nearbyServices.length, searchLabel]);

  const goToServices = React.useCallback(() => {
    router.push('/(tabs)/services');
  }, [router]);

  const handleSearchPress = React.useCallback(() => {
    router.push('/(app)/explore');
  }, [router]);

  const handleExpandRadius = React.useCallback(() => {
    const next = getNextRadiusKm(radiusKm);
    if (next) setRadiusKm(next);
  }, [radiusKm, setRadiusKm]);

  const nearbySubtitle = nearbyLoading
    ? `Finding workers near ${searchLabel}…`
    : nearbyServices.length > 0
      ? `${nearbyServices.length} available within ${radiusKm} km`
      : `No workers available within ${radiusKm} km`;

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
                onFilterPress={goToServices}
              />
            </View>

            <HomeBanner />
            <EmergencyProblems />
            <PopularServices />

            <HomeWorkerSection
              title='Top Workers'
              workers={topWorkers}
              loading={topLoading}
              layout='carousel'
            />

            <HomeWorkerSection
              title='Emergency Ready'
              workers={emergencyReady}
              loading={emergencyLoading}
              layout='carousel'
            />

            <HomeWorkerSection
              title='New on Worknet'
              workers={newlyJoined}
              loading={newLoading}
              layout='carousel'
            />

            <View style={styles.nearbyBlock}>
              <SectionHeader
                title='Nearby'
                subtitle={nearbySubtitle}
                onActionPress={goToServices}
              />
              <RadiusSelector />

              {nearbyLoading ? (
                <ActivityIndicator style={styles.loader} />
              ) : nearbyServices.length === 0 ? (
                <NearbyEmptyState
                  searchLabel={searchLabel}
                  radiusKm={radiusKm}
                  fallbackArea={fallbackArea}
                  onExpandRadius={handleExpandRadius}
                  onSearchArea={(area) =>
                    setSearchOrigin({
                      latitude: area.latitude,
                      longitude: area.longitude,
                      label: area.name,
                      source: 'area',
                    })
                  }
                  onViewMap={() => router.push('/(tabs)/map')}
                />
              ) : (
                <HomeWorkerSection
                  workers={nearbyServices}
                  title='Nearby'
                  layout='grid'
                  showSave
                  hideHeader
                />
              )}
            </View>
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
  nearbyBlock: {
    marginTop: Layout.sectionGap,
    gap: Layout.blockGap,
  },
  loader: {
    marginVertical: Layout.sectionGap,
  },
  scrollContent: {},
});
