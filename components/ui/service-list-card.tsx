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
  availabilityStatus?: 'online' | 'offline';
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
  availabilityStatus,
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
    [theme.card, theme.border],
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
              size={11}
              color={theme.gold}
              fill={theme.gold}
            />
            <ThemedText style={[styles.ratingText, { color: theme.gold }]}>
              {isNew ? 'New' : rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name='navigation' size={10} color={theme.subtext} />
              <ThemedText style={[styles.metaText, { color: theme.subtext }]}>
                {distance}
              </ThemedText>
            </View>
            <View style={[styles.metaDot, { backgroundColor: theme.border }]} />
            <ThemedText style={styles.availabilityText}>
              {availabilityStatus === 'online' ? 'Available' : 'Offline'}
            </ThemedText>
          </View>

          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceText}>{startingPrice}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainInfo: {
    flex: 1,
    marginRight: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 0,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
