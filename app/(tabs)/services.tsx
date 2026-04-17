import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { FilterOptions, FilterSheet } from '@/components/ui/filter-sheet';
import { ServiceListCard } from '@/components/ui/service-list-card';
import { PROBLEMS, Problem } from '@/constants/problems';
import { Colors } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useLocation } from '@/context/location';
import { db } from '@/lib/firebase';
import { calculateDistance, getNearbyProviders } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
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
} from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTER_CHIPS = [
  'Filters',
  'Nearest',
  'Top Rated',
  'Available Now',
] as const;

export default function ServicesScreen() {
  const {
    category: initialCategory,
    problem: initialProblem,
    searchText: initialSearch,
  } = useLocalSearchParams<{
    category: string;
    problem: string;
    searchText: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTER_CHIPS)[number]>('Nearest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null,
  );
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
    initialProblem
      ? PROBLEMS.find((p) => p.slug === initialProblem) || null
      : null,
  );
  const [refreshing, setRefreshing] = useState(false);
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
  const { coords, country } = useLocation();

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
  }, [initialCategory, initialProblem, initialSearch]);

  useEffect(() => {
    async function setupQuery() {
      setLoading(true);
      setLastVisible(null);
      setHasMore(true);

      // 1. Check if Nearest chip or distance filter is active
      if (activeFilter === 'Nearest' && coords) {
        try {
          // "Nearest" now only sorts, not filters by distance range
          // To implement sorting by nearest in Firestore, we use geohashes
          // For now, we fetch a larger set and sort locally since Firestore doesn't support distance sort directly
          // We can use a large radius (e.g. 500km) to simulate "no distance filter" but still use geohashes
          const radius = 500;

          const results = await getNearbyProviders(
            coords.latitude,
            coords.longitude,
            radius,
          );

          // Sort by actual distance
          let sortedResults = (
            results as (ServiceProvider & { distance: number })[]
          ).sort((a, b) => a.distance - b.distance);

          if (selectedProblem) {
            const allowedNames = selectedProblem.workerTypes?.map(
              (id) => WORKER_TYPES.find((w) => w.id === id)?.name,
            );
            sortedResults = sortedResults.filter(
              (p) =>
                allowedNames?.includes(p.primaryProfession) ||
                p.tags?.includes(selectedProblem.slug),
            );
          }

          setServices(sortedResults);
          setLoading(false);
          setHasMore(false); // getNearbyProviders currently fetches all at once
          return;
        } catch (error) {
          console.error('Error in nearby search:', error);
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

      let filtered = providers;
      if (selectedProblem) {
        const allowedNames = selectedProblem.workerTypes?.map(
          (id) => WORKER_TYPES.find((w) => w.id === id)?.name,
        );
        filtered = providers.filter(
          (p) =>
            allowedNames?.includes(p.primaryProfession) ||
            p.tags?.includes(selectedProblem.slug),
        );
      }

      setServices(filtered);
      setLoading(false);
    }

    setupQuery();
  }, [
    activeFilter,
    advancedFilters,
    selectedCategory,
    selectedProblem,
    coords,
    country,
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

      let filtered = providers;
      if (selectedProblem) {
        const allowedNames = selectedProblem.workerTypes?.map(
          (id) => WORKER_TYPES.find((w) => w.id === id)?.name,
        );
        filtered = providers.filter(
          (p) =>
            allowedNames?.includes(p.primaryProfession) ||
            p.tags?.includes(selectedProblem.slug),
        );
      }

      setServices((prev) => [...prev, ...filtered]);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side search
  useEffect(() => {
    let result = [...services];

    // Search filter
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerSearch) ||
          (s.title && s.title.toLowerCase().includes(lowerSearch)) ||
          (s.primaryProfession &&
            s.primaryProfession.toLowerCase().includes(lowerSearch)) ||
          (s.tags &&
            s.tags.some((t) => t.toLowerCase().includes(lowerSearch))) ||
          (s.bio && s.bio.toLowerCase().includes(lowerSearch)),
      );
    }

    // Distance filter
    if (advancedFilters?.distance && coords && activeFilter !== 'Nearest') {
      const maxDistance = advancedFilters.distance;

      if (maxDistance > 0) {
        result = result.filter((s) => {
          if (s.location?.latitude && s.location?.longitude) {
            const dist = calculateDistance(
              coords.latitude,
              coords.longitude,
              s.location.latitude,
              s.location.longitude,
            );
            return dist <= maxDistance;
          }
          return false;
        });
      }
    }

    // Price range filter
    if (advancedFilters?.priceRange && advancedFilters.priceRange !== 'All') {
      const range = advancedFilters.priceRange;
      result = result.filter((s) => {
        const rate = s.pricing?.baseRate || 0;
        if (range === 'Below $50' || range === '< $50') return rate < 50;
        if (range === '$50 - $100') return rate >= 50 && rate <= 100;
        if (range === 'Above $100' || range === '> $100') return rate > 100;
        return true;
      });
    }

    setFilteredServices(result);
  }, [searchText, services, advancedFilters, coords, activeFilter]);

  const handleOpenFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.present();
  }, []);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    // The setupQuery in useEffect triggers when these deps change.
    // If we want a true refresh, we can toggle or just force it.
    // For now, let's just trigger a re-run of the nearest logic if active
    // or just wait for the effect to finish if we add a refresh trigger.
    // For simplicity, let's just re-set the state to trigger the effect.
    setActiveFilter((prev) => (prev === 'Nearest' ? 'Nearest' : prev));
    setRefreshing(false);
  }, []);

  const renderServiceItem = useCallback(
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
        <View>
          <ServiceListCard
            id={item.id}
            name={item.name}
            role={item.primaryProfession || 'Professional'}
            rating={item.rating || 0}
            isVerified={item.isVerified}
            distance={displayDistance}
            startingPrice={
              item.pricing?.baseRate
                ? `LKR ${item.pricing.baseRate}/hr`
                : 'LKR 1,500/hr'
            }
            imageUrl={item.imageUrl}
            availabilityStatus={item.availabilityStatus}
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
    <ThemedView style={[styles.container]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Search Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <Feather name='search' size={18} color={theme.accent} />
            <TextInput
              placeholder='Search services...'
              placeholderTextColor={theme.subtext}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Feather name='x-circle' size={18} color={theme.subtext} />
              </TouchableOpacity>
            )}
          </View>
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
                          ? prob.color || theme.text
                          : theme.card,
                      borderColor: theme.border,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name={prob.icon as any}
                    size={14}
                    color={
                      selectedProblem?.slug === prob.slug
                        ? '#FFFFFF'
                        : prob.color || theme.accent
                    }
                  />
                  <ThemedText
                    style={[
                      styles.problemMiniText,
                      {
                        color:
                          selectedProblem?.slug === prob.slug
                            ? '#FFFFFF'
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
                      backgroundColor: theme.accent,
                      borderColor: theme.border,
                    },
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
                      backgroundColor: theme.accent,
                      borderColor: theme.border,
                    },
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
            <ActivityIndicator size='large' color={theme.accent} />
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            renderItem={renderServiceItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.accent}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size='small' color={theme.accent} />
                </View>
              ) : null
            }
            ListEmptyComponent={listEmptyComponent}
          />
        )}
      </SafeAreaView>

      <AppBottomSheet ref={bottomSheetRef} snapPoints={['90%']}>
        <FilterSheet
          onClose={() => bottomSheetRef.current?.dismiss()}
          initialFilters={
            advancedFilters || {
              sortBy: 'Nearest',
              rating: '4.0 & Up',
              distance: 25,
              priceRange: 'All',
            }
          }
          onApply={(filters) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setAdvancedFilters(filters);
            setActiveFilter('Filters');
            bottomSheetRef.current?.dismiss();
          }}
        />
      </AppBottomSheet>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  problemSwitcher: {
    marginBottom: 12,
  },
  problemScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  problemMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
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
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
