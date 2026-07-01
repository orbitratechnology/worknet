import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { ServiceCard } from '@/components/ui/service-card';
import { Layout, cardShadow } from '@/constants/theme';
import { useSavedProviders } from '@/hooks/use-saved-providers';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from '@react-native-firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

export default function SavedWorkersScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const { contentBottom } = useScreenInsets();
  const { savedIds, loading: savedLoading } = useSavedProviders();
  const [workers, setWorkers] = useState<ServiceProvider[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  useEffect(() => {
    if (!savedIds.length) {
      setWorkers([]);
      setLoadingWorkers(false);
      return;
    }

    let cancelled = false;
    setLoadingWorkers(true);

    Promise.all(
      savedIds.map(async (id) => {
        const snap = await getDoc(doc(db, 'service_providers', id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as ServiceProvider;
        }
        return null;
      }),
    )
      .then((results) => {
        if (!cancelled) {
          setWorkers(results.filter(Boolean) as ServiceProvider[]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingWorkers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [savedIds]);

  const loading = savedLoading || loadingWorkers;

  const renderWorker = useCallback(
    ({ item }: { item: ServiceProvider }) => (
      <View style={styles.gridItem}>
        <ServiceCard
          id={item.id}
          name={item.name}
          role={item.primaryProfession}
          distance={item.location?.homeCity ?? 'Saved'}
          price={
            item.pricing?.baseRate
              ? `LKR ${item.pricing.baseRate}/hr`
              : 'Contact for price'
          }
          imageUrl={item.imageUrl}
          rating={item.rating}
          reviewCount={item.reviewCount}
          availabilityStatus={item.availabilityStatus}
          showSave
        />
      </View>
    ),
    [],
  );

  return (
    <ScreenShell>
      <StackHeader title='Saved Workers' />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={theme.text} />
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.center}>
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                boxShadow: cardShadow(scheme),
              },
            ]}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.muted },
              ]}>
              <Feather name='heart' size={24} color={theme.subtext} />
            </View>
            <ThemedText style={styles.emptyTitle}>No saved workers yet</ThemedText>
            <ThemedText style={[styles.emptySub, { color: theme.subtext }]}>
              Tap the heart on any worker profile to save them here for quick
              access.
            </ThemedText>
            <Pressable
              onPress={() => router.replace('/')}
              style={({ pressed }) => [
                styles.emptyBtn,
                { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 },
              ]}>
              <ThemedText
                style={[styles.emptyBtnText, { color: theme.onAccent }]}>
                Explore Workers
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentInsetAdjustmentBehavior='automatic'
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: contentBottom },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
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
  emptyCard: {
    width: '100%',
    padding: 24,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
