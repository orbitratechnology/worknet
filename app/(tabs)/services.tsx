import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { FilterOptions, FilterSheet } from '@/components/ui/filter-sheet';
import { ServiceListCard } from '@/components/ui/service-list-card';
import { Colors } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { db } from '@/lib/firebase';
import { calculateDistance, getNearbyProviders } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
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

const FILTER_CHIPS = ['Filters', 'Nearest', 'Top Rated', 'Available Now'];

export default function ServicesScreen() {
  const { category: initialCategory } = useLocalSearchParams<{
    category: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [activeFilter, setActiveFilter] = useState('Nearest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceProvider[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions | null>(
    null
  );
  const { coords } = useLocation();

  useEffect(() => {
    // Update category if it changes in params
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    async function setupQuery() {
      setLoading(true);

      // 1. Check if Nearest chip or distance filter is active
      if (activeFilter === 'Nearest' && coords) {
        try {
          const radius =
            advancedFilters?.distance === 'City (10km)'
              ? 10
              : advancedFilters?.distance === 'Walking (2km)'
              ? 2
              : 25;

          const results = await getNearbyProviders(
            coords.latitude,
            coords.longitude,
            radius
          );

          // Additional server-side filters (manual filter on results)
          let filteredResults = results as ServiceProvider[];

          if (selectedCategory) {
            filteredResults = filteredResults.filter((p) =>
              p.categories?.includes(selectedCategory)
            );
          }

          if (activeFilter === 'Available Now') {
            filteredResults = filteredResults.filter((p) => p.isAvailable);
          }

          setServices(filteredResults);
          setLoading(false);
          return; // Skip normal onSnapshot
        } catch (error) {
          console.error('Error in nearby search:', error);
        }
      }

      // 2. Normal Query logic (Real-time)
      let q = query(collection(db, 'service_providers'), limit(50));

      // Category filter
      if (selectedCategory) {
        q = query(q, where('categories', 'array-contains', selectedCategory));
      }

      // Combine activeFilter (chips) and advancedFilters
      if (activeFilter === 'Available Now') {
        q = query(q, where('isAvailable', '==', true));
      }

      // Apply Sorting and Rating logic together to avoid duplicate/invalid orderBy
      const minRating =
        advancedFilters?.rating && advancedFilters.rating !== 'All Ratings'
          ? parseFloat(advancedFilters.rating.split(' ')[0])
          : null;

      if (minRating !== null && !isNaN(minRating)) {
        q = query(q, where('rating', '>=', minRating));
        q = query(q, orderBy('rating', 'desc'));

        const currentSort = advancedFilters?.sortBy || activeFilter;
        if (currentSort === 'Most Experienced') {
          q = query(q, orderBy('experienceYears', 'desc'));
        }
      } else {
        const currentSort = advancedFilters?.sortBy || activeFilter;
        if (currentSort === 'Top Rated' || currentSort === 'Highest Rating') {
          q = query(q, orderBy('rating', 'desc'));
        } else if (currentSort === 'Most Experienced') {
          q = query(q, orderBy('experienceYears', 'desc'));
        }
      }

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const providers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ServiceProvider[];
          setServices(providers);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching services:', error);
          setLoading(false);
        }
      );
    }

    setupQuery();

    return () => unsubscribe();
  }, [activeFilter, advancedFilters, selectedCategory, coords]);

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
          (s.professions &&
            s.professions.some((p) => p.toLowerCase().includes(lowerSearch))) ||
          (s.tags &&
            s.tags.some((t) => t.toLowerCase().includes(lowerSearch))) ||
          (s.bio && s.bio.toLowerCase().includes(lowerSearch))
      );
    }

    // Distance filter
    if (advancedFilters?.distance && coords && activeFilter !== 'Nearest') {
      const distanceLabel = advancedFilters.distance;
      const maxDistance =
        distanceLabel === 'Walking (2km)'
          ? 2
          : distanceLabel === 'City (10km)'
          ? 10
          : distanceLabel === 'Province (25km)'
          ? 25
          : 0;

      if (maxDistance > 0) {
        result = result.filter((s) => {
          if (s.location?.lat && s.location?.lng) {
            const dist = calculateDistance(
              coords.latitude,
              coords.longitude,
              s.location.lat,
              s.location.lng
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
    bottomSheetRef.current?.present();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const renderServiceItem = useCallback(
    ({ item }: { item: ServiceProvider }) => {
      let displayDistance = 'Nearby';
      if (coords && item.location?.lat && item.location?.lng) {
        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          item.location.lat,
          item.location.lng
        );
        displayDistance = dist < 1 ? 'Under 1km' : `${dist.toFixed(1)}km`;
      }

      return (
        <ServiceListCard
          id={item.id}
          name={item.name}
          role={item.professions ? item.professions[0] : 'Professional'}
          rating={item.rating || 0}
          isVerified={item.isVerified}
          distance={displayDistance}
          startingPrice={
            item.pricing?.baseRate
              ? `LKR ${item.pricing.baseRate}/hr`
              : 'LKR 1,500/hr'
          }
          imageUrl={item.imageUrl}
        />
      );
    },
    [coords]
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
    [theme.border, theme.subtext]
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
            <Feather name='search' size={18} color={theme.subtext} />
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
                    advancedFilters[k as keyof FilterOptions] !== 'All Ratings'
                ).length > 0
                  ? ` (${
                      Object.keys(advancedFilters || {}).filter(
                        (k) =>
                          advancedFilters?.[k as keyof FilterOptions] &&
                          advancedFilters[k as keyof FilterOptions] !== 'All' &&
                          advancedFilters[k as keyof FilterOptions] !==
                            'All Ratings'
                      ).length
                    })`
                  : ''}
              </ThemedText>
            </TouchableOpacity>

            {/* Selected Category Chip */}
            {selectedCategory && (
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: theme.text,
                    borderColor: theme.border,
                  },
                ]}>
                <ThemedText
                  style={[styles.filterText, { color: theme.background }]}>
                  {selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)}
                </ThemedText>
                <Feather
                  name='x'
                  size={12}
                  color={theme.background}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            )}

            {/* Basic Filter Chips */}
            {FILTER_CHIPS.slice(1).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
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
            ListEmptyComponent={listEmptyComponent}
          />
        )}
      </SafeAreaView>

      <AppBottomSheet ref={bottomSheetRef}>
        <FilterSheet
          onClose={() => bottomSheetRef.current?.dismiss()}
          onApply={(filters) => {
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
