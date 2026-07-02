import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { MapFilterSheet } from '@/components/ui/map-filter-sheet';
import { PROBLEMS } from '@/constants/problems';
import { Layout, chipBorderWidth, getSurfaceStyle } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useLocation } from '@/context/location';
import { useSearchLocation } from '@/context/search-location';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import {
  useColorSchemeMode,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { calculateDistance, getNearbyProviders } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const LATITUDE_DELTA = 0.02;

export default function MapScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const longitudeDelta = LATITUDE_DELTA * (width / height);
  const { problem: initialProblem, pickSearchOrigin } = useLocalSearchParams<{
    problem: string;
    pickSearchOrigin: string;
  }>();
  const isPickingOrigin = pickSearchOrigin === '1';
  const scheme = useColorSchemeMode();
  const surfaceStyle = useSurfaceStyle();
  const elevatedSurface = useSurfaceStyle('elevated');
  const chipSurface = (selected: boolean) => ({
    ...(selected ? {} : getSurfaceStyle(scheme, 'soft')),
    borderWidth: chipBorderWidth(scheme, selected),
  });
  const theme = useTheme();
  const { top, contentBottom } = useScreenInsets({ tabBar: true });
  const { refreshLocation } = useLocation();
  const {
    coords,
    radiusKm,
    setRadiusKm,
    searchOrigin,
    setSearchOrigin,
  } = useSearchLocation();
  const mapRef = useRef<MapView>(null);
  const filterBottomSheetRef = useRef<BottomSheetModal>(null);

  const [providers, setProviders] = useState<
    (ServiceProvider & { distance: number })[]
  >([]);
  const [filteredProviders, setFilteredProviders] = useState<
    (ServiceProvider & { distance: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(
    initialProblem || null,
  );
  const [selectedWorkerType, setSelectedWorkerType] = useState<string | null>(
    null,
  );

  const [mapRegion, setMapRegion] = useState({
    latitude: coords?.latitude || 6.9271,
    longitude: coords?.longitude || 79.8612,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: longitudeDelta,
  });

  const [showSearchHere, setShowSearchHere] = useState(false);

  useEffect(() => {
    if (initialProblem) {
      setSelectedProblem(initialProblem);
    }
  }, [initialProblem]);

  // Update region when search origin changes
  useEffect(() => {
    if (coords) {
      const newRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: longitudeDelta,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchProviders(coords.latitude, coords.longitude, radiusKm);
    } else {
      fetchProviders(mapRegion.latitude, mapRegion.longitude, radiusKm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, radiusKm]);

  const fetchProviders = async (lat: number, lng: number, radius: number) => {
    setLoading(true);
    try {
      const nearby = await getNearbyProviders(lat, lng, radius);
      setProviders(nearby);
      applyFilters(nearby, selectedProblem);
    } catch (error) {
      console.error('Error fetching map providers:', error);
    } finally {
      setLoading(false);
      setShowSearchHere(false);
    }
  };

  const applyFilters = (
    data: (ServiceProvider & { distance: number })[],
    problemSlug: string | null,
    workerType: string | null = selectedWorkerType,
  ) => {
    let result = data;

    if (problemSlug) {
      const problem = PROBLEMS.find((p) => p.slug === problemSlug);
      if (problem) {
        const allowedNames = problem.workerTypes?.map(
          (id) => WORKER_TYPES.find((w) => w.id === id)?.name,
        );
        result = data.filter(
          (p) =>
            allowedNames?.includes(p.primaryProfession) ||
            p.tags?.includes(problem.slug),
        );
      }
    }

    if (workerType) {
      const type = WORKER_TYPES.find((w) => w.name === workerType);
      if (type) {
        result = result.filter((p) =>
          p.primaryProfession?.toLowerCase().includes(type.name.toLowerCase()),
        );
      }
    }

    // Apply coverage area logic
    // Since we moved to a radius-based approach, getNearbyProviders already filters by distance (radius)
    // and checks if the customer is within the provider's serviceRadius.

    setFilteredProviders(result);
  };

  const handleProblemSelect = (slug: string) => {
    Haptics.selectionAsync();
    const newProblem = selectedProblem === slug ? null : slug;
    setSelectedProblem(newProblem);
    setSelectedWorkerType(null);
    applyFilters(providers, newProblem, null);
  };

  const handleWorkerTypeSelect = (name: string) => {
    Haptics.selectionAsync();
    const newType = selectedWorkerType === name ? null : name;
    setSelectedWorkerType(newType);
    setSelectedProblem(null);
    applyFilters(providers, null, newType);
  };

  const onRegionChangeComplete = (region: {
    latitude: number;
    longitude: number;
  }) => {
    setMapRegion((prev) => ({ ...prev, ...region }));

    const originLat = searchOrigin?.latitude ?? coords?.latitude;
    const originLng = searchOrigin?.longitude ?? coords?.longitude;
    if (originLat != null && originLng != null) {
      const dist = calculateDistance(
        originLat,
        originLng,
        region.latitude,
        region.longitude,
      );
      if (dist > radiusKm / 10 || dist > 2) {
        setShowSearchHere(true);
      } else {
        setShowSearchHere(false);
      }
    }
  };

  const handleSearchHere = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let label = 'Map area';
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      });
      label =
        address?.city ||
        address?.subregion ||
        address?.district ||
        'Map area';
    } catch {
      // keep default label
    }

    setSearchOrigin({
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
      label,
      source: 'map',
    });

    if (isPickingOrigin) {
      router.setParams({ pickSearchOrigin: undefined });
    }
  };

  const handleCenterAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (coords) {
      const newRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: longitudeDelta,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchProviders(coords.latitude, coords.longitude, radiusKm);
    } else {
      refreshLocation();
    }
  };

  const commonWorkerTypes = WORKER_TYPES.filter((w) =>
    [
      'Plumber',
      'Electrician',
      'Carpenter',
      'Handyman',
      'House cleaning',
      'Car mechanic',
      'AC repair/service',
    ].includes(w.name),
  );

  return (
    <ThemedView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        customMapStyle={scheme === 'dark' ? darkMapStyle : []}
        showsUserLocation
        showsMyLocationButton={false}>
        {filteredProviders.map((provider) => {
          // Ensure we have valid coordinates
          if (!provider.location?.latitude || !provider.location?.longitude) {
            return null;
          }

          return (
            <Marker
              key={provider.id}
              coordinate={{
                latitude: provider.location.latitude,
                longitude: provider.location.longitude,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(app)/public-profile',
                  params: { id: provider.id },
                });
              }}>
              <View
                style={[
                  styles.markerContainer,
                  {
                    borderColor:
                      provider.availabilityStatus === 'online'
                        ? '#4CAF50'
                        : '#FF3B30',
                    backgroundColor: theme.background,
                  },
                ]}>
                <Image
                  source={{
                    uri:
                      provider.imageUrl ||
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(provider.name),
                  }}
                  style={styles.markerImage}
                  resizeMode='cover'
                />
              </View>
              <Callout
                tooltip
                onPress={() =>
                  router.push({
                    pathname: '/(app)/public-profile',
                    params: { id: provider.id },
                  })
                }>
                <View
                  style={[
                    styles.calloutContainer,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    surfaceStyle,
                  ]}>
                  <ThemedText style={styles.calloutName} type='defaultSemiBold'>
                    {provider.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.calloutTitle, { color: theme.subtext }]}
                    numberOfLines={1}>
                    {provider.primaryProfession || 'Provider'}
                  </ThemedText>
                  <View style={styles.calloutRating}>
                    <Feather
                      name='star'
                      size={12}
                      color='#FFB800'
                      fill='#FFB800'
                    />
                    <ThemedText style={styles.calloutRatingText}>
                      {provider.rating.toFixed(1)}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.calloutArrow,
                      { borderTopColor: theme.card },
                    ]}
                  />
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating UI Elements */}
      <View
        style={[styles.floatingContent, { paddingTop: top }]}
        pointerEvents='box-none'>
        {/* Top Header/Category Filter */}
        <View style={styles.topContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                filterBottomSheetRef.current?.present();
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                chipSurface(false),
              ]}>
              <Feather name='sliders' size={16} color={theme.accent} />
              <ThemedText style={[styles.categoryText, { color: theme.text }]}>
                Filters {radiusKm}km
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {commonWorkerTypes.map((type, index) => (
              <View key={type.id}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => handleWorkerTypeSelect(type.name)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedWorkerType === type.name
                          ? type.color || theme.accent
                          : theme.card,
                      borderColor: theme.border,
                    },
                    chipSurface(selectedWorkerType === type.name),
                  ]}>
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={16}
                    color={
                      selectedWorkerType === type.name
                        ? theme.onAccent
                        : type.color || theme.accent
                    }
                  />
                  <ThemedText
                    style={[
                      styles.categoryText,
                      {
                        color:
                          selectedWorkerType === type.name
                            ? theme.onAccent
                            : theme.text,
                      },
                    ]}>
                    {type.name}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Pick location hint */}
        {isPickingOrigin ? (
          <View
            style={[
              styles.pickHint,
              { backgroundColor: theme.card, borderColor: theme.border },
              surfaceStyle,
            ]}>
            <Feather name='info' size={14} color={theme.accent} />
            <ThemedText style={[styles.pickHintText, { color: theme.text }]}>
              Move the map, then tap Search this area
            </ThemedText>
          </View>
        ) : null}

        {/* Search Here Button */}
        {showSearchHere && (
          <View>
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.searchHereBtn, { backgroundColor: theme.accent }]}
              onPress={handleSearchHere}>
              {loading ? (
                <ActivityIndicator size='small' color={theme.onAccent} />
              ) : (
                <>
                  <Feather name='refresh-cw' size={14} color={theme.onAccent} />
                  <ThemedText
                    style={[styles.searchHereText, { color: theme.onAccent }]}>
                    {isPickingOrigin ? 'Set search area' : 'Search this area'}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.bottomActions, { paddingBottom: contentBottom }]}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              elevatedSurface,
            ]}
            onPress={handleCenterAction}>
            <MaterialCommunityIcons
              name='crosshairs-gps'
              size={24}
              color={theme.accent}
            />
          </TouchableOpacity>
        </View>
      </View>

      <AppBottomSheet ref={filterBottomSheetRef} snapPoints={['85%']} scrollable>
        <MapFilterSheet
          selectedProblem={selectedProblem}
          selectedWorkerType={selectedWorkerType}
          distanceKm={radiusKm}
          onDistanceChange={setRadiusKm}
          onSelectProblem={(slug) => {
            handleProblemSelect(slug || '');
          }}
          onSelectWorkerType={(name) => {
            handleWorkerTypeSelect(name || '');
          }}
          onClose={() => filterBottomSheetRef.current?.dismiss()}
        />
      </AppBottomSheet>
    </ThemedView>
  );
}

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingContent: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topContainer: {
    paddingTop: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    gap: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    gap: 8,
  },
  divider: {
    width: 1,
    height: 24,
    alignSelf: 'center',
    marginHorizontal: 4,
  },
  searchHereBtn: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderCurve: 'continuous',
  },
  pickHint: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    marginTop: 4,
  },
  pickHintText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchHereText: {
    fontSize: 13,
    fontWeight: '800',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  calloutContainer: {
    width: 180,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  calloutName: {
    fontSize: 14,
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: 12,
    marginBottom: 6,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calloutReviews: {
    fontSize: 11,
  },
  calloutArrow: {
    position: 'absolute',
    bottom: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bottomActions: {
    paddingHorizontal: Layout.screenPadding,
    alignItems: 'flex-end',
  },
  actionBtn: {
    width: Layout.minTouch + 10,
    height: Layout.minTouch + 10,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
});
