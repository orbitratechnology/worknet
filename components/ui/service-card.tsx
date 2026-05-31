import { cardShadow, Layout, type ColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { BlurTargetView, BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

/** Portrait card — 10:16 (width:height). */
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
  isVerified?: boolean;
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
    const amount = Number.parseInt(price.replace('LKR ', '').replace('/hr', ''), 10);
    if (!Number.isNaN(amount) && amount >= 1000) {
      const compact =
        amount % 1000 === 0 ? `${amount / 1000}k` : `${(amount / 1000).toFixed(1)}k`;
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
  const blurTint = isDark ? 'systemThinMaterialDark' : 'systemThinMaterialLight';

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
  isVerified,
}: ServiceCardProps) {
  const colorScheme = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = useTheme();
  const router = useRouter();
  const blurTargetRef = useRef<View | null>(null);
  const isAndroid = process.env.EXPO_OS === 'android';
  const isOnline = availabilityStatus === 'online';
  const isDark = scheme === 'dark';

  const handlePress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(app)/public-profile',
      params: { id },
    });
  }, [id, router]);

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
      <View
        style={[
          styles.card
        ]}>
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

          <View style={styles.footer}>
            <GlassFooter isDark={isDark} blurTargetRef={blurTargetRef}>
              <View style={styles.footerMain}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.nameOnImage} numberOfLines={1}>
                    {name}
                  </ThemedText>
                  {isVerified ? (
                    <View
                      style={[
                        styles.verifiedBadge,
                        { backgroundColor: theme.success },
                      ]}
                      accessibilityLabel='Verified provider'>
                      <Feather name='check' size={8} color='#FFFFFF' />
                    </View>
                  ) : null}
                </View>
                <ThemedText
                  style={[styles.roleOnImage, { color: onImageMuted }]}
                  numberOfLines={1}>
                  {role}
                </ThemedText>
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
    maxWidth: '78%',
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
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 2,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
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
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOnImage: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 1,
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
    gap: 4,
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
