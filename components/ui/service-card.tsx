import { cardShadow, Layout, type ColorScheme } from '@/constants/theme';
import { useAuthGate } from '@/context/auth-gate';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSavedProviders } from '@/hooks/use-saved-providers';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { BlurTargetView, BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

export const SERVICE_CARD_IMAGE_ASPECT = 10 / 16;

export interface ServiceCardProps {
  id: string;
  name: string;
  role: string;
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

function DistanceBadge({ label }: { label: string }) {
  return (
    <View style={styles.distanceBadge} accessibilityLabel={label}>
      <Feather name='map-pin' size={10} color='#FFFFFF' />
      <ThemedText style={styles.distanceBadgeText} numberOfLines={1} selectable>
        {label}
      </ThemedText>
    </View>
  );
}

function formatPriceLabel(price: string) {
  if (price.startsWith('LKR ')) {
    const amount = Number.parseInt(
      price.replace('LKR ', '').replace('/hr', ''),
      10,
    );
    if (!Number.isNaN(amount) && amount >= 1000) {
      const compact =
        amount % 1000 === 0
          ? `${amount / 1000}k`
          : `${(amount / 1000).toFixed(1)}k`;
      return `${compact}/hr`;
    }
    if (!Number.isNaN(amount)) return `${amount}/hr`;
  }
  if (price === 'Contact for price') return 'Ask';
  return price;
}

function GlassFooter({
  isDark,
  blurTargetRef,
  children,
}: {
  isDark: boolean;
  blurTargetRef?: React.RefObject<View | null>;
  children: React.ReactNode;
}) {
  const isAndroid = process.env.EXPO_OS === 'android';
  const blurTint = isDark
    ? 'systemThinMaterialDark'
    : 'systemThinMaterialLight';

  return (
    <View style={styles.footerGlass}>
      <BlurView
        blurTarget={isAndroid ? blurTargetRef : undefined}
        blurMethod={isAndroid ? 'dimezisBlurViewSdk31Plus' : undefined}
        intensity={25}
        tint={blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.footerContent}>{children}</View>
    </View>
  );
}

export const ServiceCard = React.memo(function ServiceCard({
  id,
  name,
  role,
  distance,
  price,
  imageUrl,
  availabilityStatus,
  rating,
  reviewCount,
  matchReason,
  showSave = false,
}: ServiceCardProps) {
  const colorScheme = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = useTheme();
  const router = useRouter();
  const { gateAction } = useAuthGate();
  const { isSaved, toggleSave } = useSavedProviders();
  const blurTargetRef = useRef<View | null>(null);
  const isAndroid = process.env.EXPO_OS === 'android';
  const isOnline = availabilityStatus === 'online';
  const isDark = scheme === 'dark';
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
  const onImageMuted = 'rgba(255,255,255,0.82)';

  const imageLayer = (
    <Image
      source={{ uri: imageUri }}
      style={StyleSheet.absoluteFill}
      contentFit='cover'
      transition={280}
    />
  );

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole='button'
      accessibilityLabel={`${name}, ${role}, ${price}, ${distance}`}
      style={({ pressed }) => [
        styles.outerShell,
        {
          boxShadow: cardShadow(scheme),
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}>
      <View style={styles.card}>
        <View style={styles.media}>
          {isAndroid ? (
            <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
              {imageLayer}
            </BlurTargetView>
          ) : (
            imageLayer
          )}

          <View style={styles.topBar}>
            <DistanceBadge label={distance} />
            <View style={styles.topBarRight}>
              {showSave ? (
                <Pressable
                  onPress={() => handleSave()}
                  hitSlop={8}
                  style={styles.saveBtn}
                  accessibilityLabel={saved ? 'Unsave worker' : 'Save worker'}>
                  <Feather
                    name='heart'
                    size={14}
                    color={saved ? '#FF6B6B' : '#FFFFFF'}
                    style={{ opacity: saved ? 1 : 0.9 }}
                  />
                </Pressable>
              ) : null}
              {availabilityStatus ? (
                <View
                  style={[styles.statusDotRing, { borderColor: '#FFFFFF' }]}
                  accessibilityLabel={isOnline ? 'Available now' : 'Offline'}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isOnline ? theme.online : theme.offline,
                      },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.footer}>
            <GlassFooter isDark={isDark} blurTargetRef={blurTargetRef}>
              <View style={styles.footerMain}>
                <ThemedText style={styles.nameOnImage} numberOfLines={1}>
                  {name}
                </ThemedText>
                <ThemedText
                  style={[styles.roleOnImage, { color: onImageMuted }]}
                  numberOfLines={1}>
                  {matchReason || role}
                </ThemedText>
                {(rating ?? 0) > 0 || (reviewCount ?? 0) > 0 ? (
                  <View style={styles.ratingRow}>
                    <Feather name='star' size={11} color='#FFD54F' />
                    <ThemedText style={styles.ratingText}>
                      {(rating ?? 0).toFixed(1)}
                      {(reviewCount ?? 0) > 0 ? ` (${reviewCount})` : ''}
                    </ThemedText>
                  </View>
                ) : null}
                <View style={styles.priceRow}>
                  <Feather name='tag' size={13} color='#FFFFFF' />
                  <ThemedText
                    style={styles.priceText}
                    numberOfLines={1}
                    selectable>
                    {priceLabel}
                  </ThemedText>
                </View>
              </View>
            </GlassFooter>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  outerShell: {
    width: '100%',
    borderRadius: Layout.cardRadius + 3,
    borderCurve: 'continuous',
    padding: 1,
  },
  card: {
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  media: {
    width: '100%',
    aspectRatio: SERVICE_CARD_IMAGE_ASPECT,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexShrink: 1,
    maxWidth: '70%',
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  statusDotRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nameOnImage: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.25,
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  roleOnImage: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerGlass: {
    overflow: 'hidden',
  },
  footerContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  footerMain: {
    gap: 2,
    minWidth: 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 18,
  },
});
