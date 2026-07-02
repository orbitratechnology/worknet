import { getSurfaceStyle, Layout, type ColorScheme } from '@/constants/theme';
import { WORKER_TYPES, type WorkerType } from '@/constants/worker-types';
import { useAuthGate } from '@/context/auth-gate';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSavedProviders } from '@/hooks/use-saved-providers';
import { useTheme } from '@/hooks/use-theme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

/** Square crop — ecommerce-style product image */
export const SERVICE_CARD_IMAGE_ASPECT = 1;

export interface ServiceCardProps {
  id: string;
  name: string;
  role: string;
  professionId?: string;
  distance: string;
  price: string;
  imageUrl?: string;
  availabilityStatus?: 'online' | 'offline';
  rating?: number;
  reviewCount?: number;
  matchReason?: string;
  showSave?: boolean;
  compact?: boolean;
}

const FALLBACK_WORKER_TYPE: Pick<WorkerType, 'icon' | 'color' | 'name'> = {
  name: 'Worker',
  icon: 'briefcase',
  color: '#717171',
};

function resolveWorkerType(
  professionId?: string,
  role?: string,
): Pick<WorkerType, 'icon' | 'color' | 'name'> {
  if (professionId) {
    const byId = WORKER_TYPES.find((w) => w.id === professionId);
    if (byId) return byId;
  }
  if (role) {
    const normalized = role.trim().toLowerCase();
    const byName = WORKER_TYPES.find(
      (w) => w.name.toLowerCase() === normalized,
    );
    if (byName) return byName;
  }
  return FALLBACK_WORKER_TYPE;
}

function formatPriceLabel(price: string) {
  if (price.startsWith('LKR ')) return price;
  if (price === 'Contact for price') return 'Contact for price';
  if (/^\d/.test(price)) return `LKR ${price}`;
  return price;
}

export const ServiceCard = React.memo(function ServiceCard({
  id,
  name,
  role,
  professionId,
  price,
  imageUrl,
  rating,
  reviewCount,
  showSave = false,
}: ServiceCardProps) {
  const colorScheme = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = useTheme();
  const router = useRouter();
  const { gateAction } = useAuthGate();
  const { isSaved, toggleSave } = useSavedProviders();
  const saved = isSaved(id);

  const handlePress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(app)/public-profile',
      params: { id },
    });
  }, [id, router]);

  const handleSave = React.useCallback(
    (e?: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      gateAction('Sign in to save workers', () => {
        toggleSave(id);
      });
    },
    [gateAction, toggleSave, id],
  );

  const imageUri = React.useMemo(
    () =>
      imageUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=222222&color=FAF7F2&bold=true&size=512`,
    [imageUrl, name],
  );

  const priceLabel = React.useMemo(() => formatPriceLabel(price), [price]);
  const hasRating = (rating ?? 0) > 0 || (reviewCount ?? 0) > 0;
  const workerType = React.useMemo(
    () => resolveWorkerType(professionId, role),
    [professionId, role],
  );
  const priceColor = theme.success;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole='button'
      accessibilityLabel={`${name}, ${role}, ${priceLabel}`}
      style={({ pressed }) => [
        styles.outerShell,
        getSurfaceStyle(scheme),
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={[styles.photoWrap, { backgroundColor: theme.muted }]}>
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit='cover'
            transition={280}
            accessibilityLabel={`Photo of ${name}`}
          />

          {showSave ? (
            <Pressable
              onPress={() => handleSave()}
              hitSlop={10}
              style={styles.saveBtn}
              accessibilityLabel={
                saved ? 'Remove bookmark' : 'Bookmark worker'
              }>
              {saved ? (
                <Ionicons name='bookmark' size={24} color={theme.text} />
              ) : (
                <Ionicons
                  name='bookmark-outline'
                  size={24}
                  color={theme.text}
                />
              )}
            </Pressable>
          ) : null}

          {hasRating ? (
            <View
              style={[styles.ratingBadge, { backgroundColor: theme.surface }]}>
              <Feather name='star' size={11} color='#EAB308' />
              <ThemedText style={[styles.ratingBadgeText, { color: theme.text }]}>
                {(rating ?? 0).toFixed(1)}
                {(reviewCount ?? 0) > 0 ? ` (${reviewCount})` : ''}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.professionBadge,
            { backgroundColor: workerType.color },
          ]}
          accessibilityLabel={workerType.name}>
          <MaterialCommunityIcons
            name={workerType.icon as never}
            size={24}
            color='#FFFFFF'
          />
        </View>

        <View style={styles.details}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {name}
          </ThemedText>

          <View style={styles.priceRow}>
            <MaterialCommunityIcons name='cash' size={15} color={priceColor} />
            <ThemedText
              style={[styles.priceText, { color: priceColor }]}
              numberOfLines={1}
              selectable>
              {priceLabel}
            </ThemedText>
          </View>

          <View style={styles.professionRow}>
            <MaterialCommunityIcons
              name={workerType.icon as never}
              size={16}
              color={workerType.color}
            />
            <ThemedText
              style={[styles.professionText, { color: theme.subtext }]}
              numberOfLines={1}>
              {role}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  outerShell: {
    width: '100%',
    borderRadius: Layout.cardRadius + 2,
    borderCurve: 'continuous',
  },
  card: {
    position: 'relative',
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
  },
  photoWrap: {
    width: '100%',
    aspectRatio: SERVICE_CARD_IMAGE_ASPECT,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: Layout.cardRadius,
    borderTopRightRadius: Layout.cardRadius,
    borderCurve: 'continuous',
  },
  professionBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderCurve: 'continuous',
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  details: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  priceText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 20,
  },
  professionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  professionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 19,
  },
});
