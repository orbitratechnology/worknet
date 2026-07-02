import { HomeBanner } from '@/components/ui/home-banner';
import { HomeScreenHeader } from '@/components/ui/home-screen-header';
import { HomeWorkerSection } from '@/components/ui/home-worker-section';
import { NearbyEmptyState } from '@/components/ui/nearby-empty-state';
import { EmergencyProblems, PopularServices } from '@/components/ui/problems';
import { RadiusSelector } from '@/components/ui/radius-selector';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedView } from '@/components/themed-view';
import { getNextRadiusKm } from '@/constants/search-defaults';
import { Layout } from '@/constants/theme';
import { useSearchLocation } from '@/context/search-location';
import { useMatchedProviders } from '@/hooks/use-matched-providers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { suggestFallbackArea } from '@/lib/search-areas';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

const SECTION_FETCH_LIMIT = 8;
const NEARBY_FETCH_LIMIT = 6;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const { coords, radiusKm, searchOrigin, setRadiusKm, setSearchOrigin } =
    useSearchLocation();
  const { top, left, right, contentBottom } = useScreenInsets({ tabBar: true });
  const bannerColor = theme.text;
  const statusBarStyle = colorScheme === 'light' ? 'light' : 'dark';

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
    <ThemedView style={styles.root}>
      <StatusBar style={statusBarStyle} backgroundColor={bannerColor} />
      <FlatList
        style={[styles.list, { paddingLeft: left, paddingRight: right }]}
        data={[]}
        renderItem={() => null}
        contentInsetAdjustmentBehavior='never'
        ListHeaderComponent={
          <>
            <HomeScreenHeader
              topInset={top}
              bannerColor={bannerColor}
              onSearchPress={handleSearchPress}
            />

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { flex: 1 },
  nearbyBlock: {
    marginTop: Layout.sectionGap,
    gap: Layout.blockGap,
  },
  loader: {
    marginVertical: Layout.sectionGap,
  },
  scrollContent: {},
});
