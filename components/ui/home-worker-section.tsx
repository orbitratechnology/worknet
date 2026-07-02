import { SectionHeader } from '@/components/ui/section-header';
import { ServiceCard } from '@/components/ui/service-card';
import { Layout } from '@/constants/theme';
import type { MatchedProvider } from '@/lib/match-providers';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

const HORIZONTAL_CARD_WIDTH = 168;

export function formatProviderPrice(baseRate?: number) {
  return baseRate ? `LKR ${baseRate}/hr` : 'Contact for price';
}

export function formatProviderDistance(
  item: MatchedProvider,
  fallback = 'Nearby',
) {
  if (item.distance === undefined) return fallback;
  return item.distance < 1 ? 'Under 1 km' : `${item.distance.toFixed(1)} km`;
}

interface HomeWorkerSectionProps {
  title: string;
  subtitle?: string;
  workers: MatchedProvider[];
  loading?: boolean;
  onSeeAll?: () => void;
  layout?: 'grid' | 'carousel';
  showSave?: boolean;
  emptyMessage?: string;
  hideHeader?: boolean;
}

export function HomeWorkerSection({
  title,
  subtitle,
  workers,
  loading,
  onSeeAll,
  layout = 'carousel',
  showSave = true,
  emptyMessage,
  hideHeader = false,
}: HomeWorkerSectionProps) {
  const { width } = useWindowDimensions();

  if (loading && !hideHeader) {
    return (
      <View style={styles.section}>
        <SectionHeader title={title} onActionPress={onSeeAll} />
        <ActivityIndicator style={styles.loader} />
      </View>
    );
  }

  if (workers.length === 0) {
    if (!emptyMessage) return null;
    return (
      <View style={styles.section}>
        <SectionHeader title={title} onActionPress={onSeeAll} />
      </View>
    );
  }

  const renderCard = (item: MatchedProvider) => (
    <ServiceCard
      id={item.id}
      name={item.name}
      role={item.primaryProfession || 'Worker'}
      professionId={item.primaryProfessionId}
      distance={formatProviderDistance(item)}
      price={formatProviderPrice(item.pricing?.baseRate)}
      imageUrl={item.imageUrl || ''}
      availabilityStatus={item.availabilityStatus}
      rating={item.rating}
      reviewCount={item.reviewCount}
      matchReason={item.matchReason}
      showSave={showSave}
    />
  );

  return (
    <View style={[styles.section, hideHeader && styles.sectionTight]}>
      {!hideHeader ? (
        <SectionHeader title={title} onActionPress={onSeeAll} />
      ) : null}

      {layout === 'grid' ? (
        <View style={styles.grid}>
          {workers.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              {renderCard(item)}
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate='fast'
          contentContainerStyle={[
            styles.carousel,
            { paddingRight: Math.max(Layout.screenPadding, width * 0.04) },
          ]}>
          {workers.map((item) => (
            <View
              key={item.id}
              style={[styles.carouselItem, { width: HORIZONTAL_CARD_WIDTH }]}>
              {renderCard(item)}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Layout.sectionGap,
    gap: Layout.blockGap,
  },
  sectionTight: {
    marginTop: 0,
    gap: 0,
  },
  loader: {
    marginVertical: Layout.blockGap,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.itemGap,
  },
  gridItem: {
    width: '48.5%',
    maxWidth: '48.5%',
  },
  carousel: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Layout.itemGap,
    gap: Layout.itemGap,
  },
  carouselItem: {
    flexShrink: 0,
  },
});
