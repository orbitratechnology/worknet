import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Categories } from '@/components/ui/categories';
import { PromoBanner } from '@/components/ui/promo-banner';
import { ServiceCard } from '@/components/ui/service-card';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [nearbyServices, setNearbyServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    // Fetch available service providers
    const q = query(
      collection(db, 'service_providers'),
      where('isAvailable', '==', true),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const providers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ServiceProvider[];
        setNearbyServices(providers);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching service providers:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderHeader = React.useMemo(
    () => (
      <View style={styles.headerContent} collapsable={false}>
        <TopBar />
        <Categories />
        <PromoBanner />
        <View style={styles.nearbyHeader}>
          <ThemedText style={styles.nearbyTitle} type='subtitle' selectable>
            Nearby Services
          </ThemedText>
          <TouchableOpacity activeOpacity={0.7}>
            <ThemedText style={[styles.seeAll, { color: theme.accent }]}>
              See All
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [theme]
  );

  const renderItem = React.useCallback(
    ({ item }: { item: ServiceProvider }) => (
      <ServiceCard
        id={item.id}
        name={item.name}
        category={item.professions ? item.professions[0] : 'General'}
        rating={item.rating || 0}
        distance='0.5km' // TODO: Calculate actual distance
        imageUrl={item.imageUrl || ''}
      />
    ),
    []
  );

  const keyExtractor = React.useCallback(
    (item: ServiceProvider) => item.id,
    []
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
