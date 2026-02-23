import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { ThemedText } from '../themed-text';

export interface ServiceListCardProps {
  id: string;
  name: string;
  role: string;
  rating: number;
  isNew?: boolean;
  isVerified?: boolean;
  distance: string;
  startingPrice: string;
  imageUrl?: string;
}

export const ServiceListCard = memo(function ServiceListCard({
  id,
  name,
  role,
  rating,
  isNew,
  isVerified,
  distance,
  startingPrice,
  imageUrl,
}: ServiceListCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(app)/public-profile',
      params: { id },
    });
  }, [id, router]);

  const containerStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.container,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      },
    ],
    [theme.card, theme.border]
  );

  return (
    <Pressable onPress={handlePress} style={containerStyle}>
      <View style={styles.imageWrapper}>
        <Image
          source={
            imageUrl ||
            'https://images.unsplash.com/photo-1521791136064-7986c2923216?w=200&h=200&fit=crop'
          }
          style={styles.image}
          contentFit='cover'
          transition={300}
        />
        {isVerified && (
          <View
            style={[
              styles.verifiedBadge,
              { backgroundColor: theme.success, borderColor: theme.card },
            ]}>
            <Feather name='check' size={10} color={theme.onSuccess} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.mainInfo}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {name}
            </ThemedText>
            <ThemedText
              style={[styles.role, { color: theme.subtext }]}
              numberOfLines={1}>
              {role}
            </ThemedText>
          </View>

          <View
            style={[styles.ratingPill, { backgroundColor: theme.gold + '20' }]}>
            <Feather
              name='star'
              size={12}
              color={theme.gold}
              fill={theme.gold}
            />
            <ThemedText style={[styles.ratingText, { color: theme.gold }]}>
              {isNew ? 'New' : rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name='navigation' size={12} color={theme.subtext} />
              <ThemedText style={[styles.metaText, { color: theme.subtext }]}>
                {distance}
              </ThemedText>
            </View>
            <View style={[styles.metaDot, { backgroundColor: theme.border }]} />
            <ThemedText style={styles.availabilityText}>Available</ThemedText>
          </View>

          <View style={styles.priceContainer}>
            <ThemedText style={[styles.pricePrefix, { color: theme.subtext }]}>
              from
            </ThemedText>
            <ThemedText style={styles.priceText}>
              LKR {startingPrice}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mainInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  role: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  pricePrefix: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
