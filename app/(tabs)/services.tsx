import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { FilterOptions, FilterSheet } from '@/components/ui/filter-sheet';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SearchField } from '@/components/ui/search-field';
import { ServiceCard } from '@/components/ui/service-card';
import { PROBLEMS, Problem } from '@/constants/problems';
import { Layout, chipBorderWidth, getSurfaceStyle } from '@/constants/theme';
import { useSearchLocation } from '@/context/search-location';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { db } from '@/lib/firebase';
import { calculateDistance, getNearbyProviders } from '@/lib/geo';
import { matchProviders, sortModeFromChip } from '@/lib/match-providers';
import { ServiceProvider } from '@/types/database';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  QueryConstraint,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from '@react-native-firebase/firestore';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const FILTER_CHIPS = [
  'Filters',
  'Best Match',
  'Nearest',
  'Top Rated',
  'Available Now',
] as const;

export default function ServicesScreen() {
  const {
    category: initialCategory,
    problem: initialProblem,
    searchText: initialSearch,
    professionId: initialProfessionId,
  } = useLocalSearchParams<{
    category: string;
    problem: string;
    searchText: string;
    professionId: string;
  }>();
  const theme = useTheme();
  const scheme = useColorSchemeMode();
  const { contentBottom } = useScreenInsets({ tabBar: true });
  const chipSurface = (selected: boolean) => ({
    ...(selected ? {} : getSurfaceStyle(scheme, 'soft')),
    borderWidth: chipBorderWidth(scheme, selected),
  });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTER_CHIPS)[number]>('Best Match');
  const [professionId, setProfessionId] = useState<string | null>(
    initialProfessionId || null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null,
  );
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
    initialProblem
      ? PROBLEMS.find((p) => p.slug === initialProblem) || null
      : null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchText, setSearchText] = useState(initialSearch || '');
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceProvider[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null,
  );
  const [hasMore, setHasMore] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions | null>(
    null,
  );
  const { coords, radiusKm, setRadiusKm, searchOrigin } = useSearchLocation();

  const PAGE_SIZE = 15;

  useEffect(() => {
    // Update category or problem if they change in params
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setSelectedProblem(null);
    }
    if (initialProblem) {
      const prob = PROBLEMS.find((p) => p.slug === initialProblem);
      if (prob) {
        setSelectedProblem(prob);
      }
    }
    if (initialSearch) {
      setSearchText(initialSearch);
    }
    if (initialProfessionId) {
      setProfessionId(initialProfessionId);
    }
  }, [initialCategory, initialProblem, initialSearch, initialProfessionId]);

  useEffect(() => {
    async function setupQuery() {
      if (!refreshing) {
        setLoading(true);
      }
      setLastVisible(null);
      setHasMore(true);

      const onlyAvailable = activeFilter === 'Available Now';

      if (
        (activeFilter === 'Nearest' || activeFilter === 'Best Match') &&
        coords
      ) {
        try {
          const results = await getNearbyProviders(
            coords.latitude,
            coords.longitude,
            radiusKm,
          );

          let sortedResults = matchProviders(
            results as (ServiceProvider & { distance: number })[],
            {
              coords,
              problemSlug: selectedProblem?.slug,
              professionId,
              searchText,
              sortMode: sortModeFromChip(activeFilter),
              onlyAvailable,
              maxDistanceKm: radiusKm,
            },
          );

          setServices(sortedResults);
          setLoading(false);
          setRefreshing(false);
          setHasMore(false); // getNearbyProviders currently fetches all at once
          return;
        } catch (error) {
          console.error('Error in nearby search:', error);
          setLoading(false);
          setRefreshing(false);
        }
      }

      // 2. Normal Query logic (Real-time with pagination)
      let queryConstraints: QueryConstraint[] = [limit(PAGE_SIZE)];

      // Combine activeFilter (chips) and advancedFilters
      if (activeFilter === 'Available Now') {
        queryConstraints.push(where('availabilityStatus', '==', 'online'));
      }

      // Apply Sorting and Rating logic together
      const ratingFilterValue = advancedFilters?.rating || '';
      const minRating =
        ratingFilterValue && ratingFilterValue !== 'All Ratings'
          ? parseFloat(ratingFilterValue.split(' ')[0])
          : null;

      if (minRating !== null && !isNaN(minRating)) {
        queryConstraints.push(where('rating', '>=', minRating));
        // Firestore requires orderBy to be on the same field as where for range filters
        queryConstraints.push(orderBy('rating', 'desc'));
        queryConstraints.push(orderBy('createdAt', 'desc'));
      } else {
        const currentSort = advancedFilters?.sortBy || activeFilter;
        if (currentSort === 'Top Rated' || currentSort === 'Highest Rating') {
          queryConstraints.push(orderBy('rating', 'desc'));
          queryConstraints.push(orderBy('createdAt', 'desc'));
        } else if (currentSort === 'Most Experienced') {
          queryConstraints.push(orderBy('experienceYears', 'desc'));
          queryConstraints.push(orderBy('createdAt', 'desc'));
        } else {
          // Default sorting
          queryConstraints.push(orderBy('createdAt', 'desc'));
        }
      }

      const q = query(collection(db, 'service_providers'), ...queryConstraints);

      const querySnapshot = await getDocs(q);
      const providers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceProvider[];

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);

      setServices(
        matchProviders(providers, {
          coords,
          problemSlug: selectedProblem?.slug,
          professionId,
          searchText,
          sortMode: sortModeFromChip(activeFilter),
          onlyAvailable: activeFilter === 'Available Now',
        }),
      );
      setLoading(false);
      setRefreshing(false);
    }

    setupQuery();
  }, [
    activeFilter,
    advancedFilters,
    selectedCategory,
    selectedProblem,
    professionId,
    coords,
    radiusKm,
    searchOrigin?.label,
    refreshTrigger,
    searchText,
  ]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !lastVisible || activeFilter === 'Nearest')
      return;

    setLoadingMore(true);
    try {
      let queryConstraints: QueryConstraint[] = [
        startAfter(lastVisible),
        limit(PAGE_SIZE),
      ];

      // Same logic as setupQuery for pagination
      if (activeFilter === 'Available Now') {
        queryConstraints.push(where('availabilityStatus', '==', 'online'));
      }

      const ratingFilterValue = advancedFilters?.rating || '';
      const minRating =
        ratingFilterValue && ratingFilterValue !== 'All Ratings'
          ? parseFloat(ratingFilterValue.split(' ')[0])
          : null;

      if (minRating !== null && !isNaN(minRating)) {
        queryConstraints.push(where('rating', '>=', minRating));
        queryConstraints.push(orderBy('rating', 'desc'));
        queryConstraints.push(orderBy('createdAt', 'desc'));
      } else {
        const currentSort = advancedFilters?.sortBy || activeFilter;
        if (currentSort === 'Top Rated' || currentSort === 'Highest Rating') {
          queryConstraints.push(orderBy('rating', 'desc'));
          queryConstraints.push(orderBy('createdAt', 'desc'));
        } else if (currentSort === 'Most Experienced') {
          queryConstraints.push(orderBy('experienceYears', 'desc'));
          queryConstraints.push(orderBy('createdAt', 'desc'));
        } else {
          queryConstraints.push(orderBy('createdAt', 'desc'));
        }
      }

      const q = query(collection(db, 'service_providers'), ...queryConstraints);

      const querySnapshot = await getDocs(q);
      const providers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceProvider[];

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);

      const filtered = matchProviders(providers, {
        coords,
        problemSlug: selectedProblem?.slug,
        professionId,
        searchText,
        sortMode: sortModeFromChip(activeFilter),
        onlyAvailable: activeFilter === 'Available Now',
      });

      setServices((prev) => [...prev, ...filtered]);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side refinement on matched results
  useEffect(() => {
    let result = matchProviders(services, {
      coords,
      problemSlug: selectedProblem?.slug,
      professionId,
      searchText,
      sortMode: sortModeFromChip(activeFilter),
      onlyAvailable: activeFilter === 'Available Now',
      minRating:
        advancedFilters?.rating && advancedFilters.rating !== 'All Ratings'
          ? parseFloat(advancedFilters.rating)
          : undefined,
      maxDistanceKm: radiusKm,
    });

    // Price range filter
    if (advancedFilters?.priceRange && advancedFilters.priceRange !== 'All') {
      const range = advancedFilters.priceRange;
      result = result.filter((s) => {
        const rate = s.pricing?.baseRate || 0;
        if (range === '< LKR 1k' || range === 'Below $50' || range === '< $50')
          return rate < 1000;
        if (range === 'LKR 1k–3k' || range === '$50 - $100')
          return rate >= 1000 && rate <= 3000;
        if (
          range === '> LKR 3k' ||
          range === 'Above $100' ||
          range === '> $100'
        )
          return rate > 3000;
        return true;
      });
    }

    setFilteredServices(result);
  }, [
    searchText,
    services,
    advancedFilters,
    coords,
    radiusKm,
    activeFilter,
    selectedProblem,
    professionId,
  ]);

  const handleOpenFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.present();
  }, []);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const renderServiceItem = useCallback(
    ({ item }: { item: ServiceProvider }) => {
      let displayDistance = 'Nearby';
      if (coords && item.location?.latitude && item.location?.longitude) {
        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          item.location.latitude,
          item.location.longitude,
        );
        displayDistance = dist < 1 ? 'Under 1 km' : `${dist.toFixed(1)} km`;
      }

      return (
        <View style={styles.gridItem}>
          <ServiceCard
            id={item.id}
            name={item.name}
            role={item.primaryProfession || 'Professional'}
            professionId={item.primaryProfessionId}
            distance={displayDistance}
            price={
              item.pricing?.baseRate
                ? `LKR ${item.pricing.baseRate}/hr`
                : 'Contact for price'
            }
            imageUrl={item.imageUrl}
            availabilityStatus={item.availabilityStatus}
            rating={item.rating}
            reviewCount={item.reviewCount}
            matchReason={(item as any).matchReason || item.primaryProfession}
            showSave
          />
        </View>
      );
    },
    [coords],
  );

  const keyExtractor = useCallback((item: ServiceProvider) => item.id, []);

  const listEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Feather name='search' size={48} color={theme.border} />
        <ThemedText style={styles.emptyTitle}>No results found</ThemedText>
        <ThemedText style={[styles.emptySub, { color: theme.subtext }]}>
          Try adjusting your search or filters
        </ThemedText>
      </View>
    ),
    [theme.border, theme.subtext],
  );

  return (
    <ScreenShell>
      <View style={styles.searchWrap}>
        <SearchField
          value={searchText}
          onChangeText={setSearchText}
          placeholder='Search services...'
        />
      </View>

      {/* Rapid Problem Switcher */}
      <View style={styles.problemSwitcher}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.problemScroll}>
          {PROBLEMS.slice(0, 10).map((prob, index) => (
            <View key={prob.id}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedProblem(prob);
                }}
                style={[
                  styles.problemMiniChip,
                  {
                    backgroundColor:
                      selectedProblem?.slug === prob.slug
                        ? theme.text
                        : theme.card,
                    borderColor: theme.border,
                  },
                  chipSurface(selectedProblem?.slug === prob.slug),
                ]}>
                <MaterialCommunityIcons
                  name={prob.icon as any}
                  size={14}
                  color={
                    selectedProblem?.slug === prob.slug
                      ? theme.onAccent
                      : theme.text
                  }
                />
                <ThemedText
                  style={[
                    styles.problemMiniText,
                    {
                      color:
                        selectedProblem?.slug === prob.slug
                          ? theme.onAccent
                          : theme.text,
                    },
                  ]}>
                  {prob.name.split(' / ')[0]}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {/* Advanced Filters Button */}
          <TouchableOpacity
            onPress={handleOpenFilters}
            style={[
              styles.filterChip,
              {
                backgroundColor: advancedFilters ? theme.text : theme.card,
                borderColor: theme.border,
              },
              chipSurface(!!advancedFilters),
            ]}>
            <Feather
              name='sliders'
              size={14}
              color={advancedFilters ? theme.background : theme.subtext}
              style={{ marginRight: 6 }}
            />
            <ThemedText
              style={[
                styles.filterText,
                {
                  color: advancedFilters ? theme.background : theme.text,
                },
              ]}>
              Filters
              {Object.keys(advancedFilters || {}).filter(
                (k) =>
                  advancedFilters?.[k as keyof FilterOptions] &&
                  advancedFilters[k as keyof FilterOptions] !== 'All' &&
                  advancedFilters[k as keyof FilterOptions] !== 'All Ratings',
              ).length > 0
                ? ` (${
                    Object.keys(advancedFilters || {}).filter(
                      (k) =>
                        advancedFilters?.[k as keyof FilterOptions] &&
                        advancedFilters[k as keyof FilterOptions] !== 'All' &&
                        advancedFilters[k as keyof FilterOptions] !==
                          'All Ratings',
                    ).length
                  })`
                : ''}
            </ThemedText>
          </TouchableOpacity>

          {/* Selected Problem Chip */}
          {selectedProblem && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedProblem(null);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: theme.text,
                    borderColor: theme.border,
                  },
                  chipSurface(true),
                ]}>
                <MaterialCommunityIcons
                  name={selectedProblem.icon as any}
                  size={16}
                  color={theme.onAccent}
                  style={{ marginRight: 6 }}
                />
                <ThemedText
                  style={[styles.filterText, { color: theme.onAccent }]}>
                  {selectedProblem.name.length > 20
                    ? selectedProblem.name.slice(0, 17) + '...'
                    : selectedProblem.name}
                </ThemedText>
                <Feather
                  name='x'
                  size={12}
                  color={theme.onAccent}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Selected Category Chip (only if no problem) */}
          {selectedCategory && !selectedProblem && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(null);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: theme.text,
                    borderColor: theme.border,
                  },
                  chipSurface(true),
                ]}>
                <ThemedText
                  style={[styles.filterText, { color: theme.onAccent }]}>
                  {selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)}
                </ThemedText>
                <Feather
                  name='x'
                  size={12}
                  style={{ marginLeft: 6, color: theme.onAccent }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Basic Filter Chips */}
          {FILTER_CHIPS.slice(1).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(filter);
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === filter ? theme.text : theme.card,
                  borderColor: theme.border,
                },
                chipSurface(activeFilter === filter),
              ]}>
              <ThemedText
                style={[
                  styles.filterText,
                  {
                    color:
                      activeFilter === filter ? theme.background : theme.text,
                  },
                ]}>
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={theme.text} />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: contentBottom },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size='small' color={theme.text} />
              </View>
            ) : null
          }
          ListEmptyComponent={listEmptyComponent}
        />
      )}

      <AppBottomSheet ref={bottomSheetRef} snapPoints={['90%']} scrollable>
        <FilterSheet
          onClose={() => bottomSheetRef.current?.dismiss()}
          initialFilters={
            advancedFilters || {
              sortBy: 'Nearest',
              rating: '4.0 & Up',
              distance: radiusKm,
              priceRange: 'All',
            }
          }
          onApply={(filters) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setAdvancedFilters(filters);
            setRadiusKm(filters.distance);
            setActiveFilter('Filters');
            bottomSheetRef.current?.dismiss();
          }}
        />
      </AppBottomSheet>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 12,
  },
  problemSwitcher: {
    marginBottom: 12,
  },
  problemScroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: 8,
  },
  problemMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    gap: 6,
  },
  problemMiniText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 4,
  },
  columnWrapper: {
    gap: Layout.itemGap,
    paddingHorizontal: 10,
    marginBottom: Layout.itemGap,
  },
  gridItem: {
    width: '48%',
    maxWidth: '48%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  emptySub: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
});
