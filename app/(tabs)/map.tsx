import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { MapFilterSheet } from '@/components/ui/map-filter-sheet';
import { PROBLEMS } from '@/constants/problems';
import { Colors } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useLocation } from '@/context/location';
import { calculateDistance, getNearbyProviders } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function MapScreen() {
  const router = useRouter();
  const { problem: initialProblem } = useLocalSearchParams<{
    problem: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { coords, country, refreshLocation } = useLocation();
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
  const [distance, setDistance] = useState(25);

  const [mapRegion, setMapRegion] = useState({
    latitude: coords?.latitude || 6.9271,
    longitude: coords?.longitude || 79.8612,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [showSearchHere, setShowSearchHere] = useState(false);

  useEffect(() => {
    if (initialProblem) {
      setSelectedProblem(initialProblem);
    }
  }, [initialProblem]);

  // Update region when location changes initially
  useEffect(() => {
    if (coords) {
      const newRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchProviders(coords.latitude, coords.longitude, distance);
    } else {
      // Fetch providers for default region if coords are not available yet
      fetchProviders(mapRegion.latitude, mapRegion.longitude, distance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

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

  const onRegionChangeComplete = (region: any) => {
    setMapRegion(region);

    if (coords) {
      const dist = calculateDistance(
        coords.latitude,
        coords.longitude,
        region.latitude,
        region.longitude,
      );
      if (dist > distance / 10 || dist > 2) {
        setShowSearchHere(true);
      } else {
        setShowSearchHere(false);
      }
    }
  };

  const handleSearchHere = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchProviders(mapRegion.latitude, mapRegion.longitude, distance);
  };

  const handleCenterAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (coords) {
      const newRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchProviders(coords.latitude, coords.longitude, distance);
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
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
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
                    borderColor: theme.accent,
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
      <SafeAreaView style={styles.floatingContent} pointerEvents='box-none'>
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
              ]}>
              <Feather name='sliders' size={16} color={theme.accent} />
              <ThemedText style={[styles.categoryText, { color: theme.text }]}>
                Filters {distance}km
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

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
                    Search this area
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.actionBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={handleCenterAction}>
            <MaterialCommunityIcons
              name='crosshairs-gps'
              size={24}
              color={theme.accent}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <AppBottomSheet ref={filterBottomSheetRef} snapPoints={['65%']}>
        <MapFilterSheet
          selectedProblem={selectedProblem}
          selectedWorkerType={selectedWorkerType}
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    borderWidth: 1,
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
    paddingHorizontal: 16,
    paddingBottom: 110, // Avoid tab bar
    alignItems: 'flex-end',
  },
  actionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
