import { ThemedText } from '@/components/themed-text';
import { cardShadow, type ColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const AVATAR_SIZE = 112;
const OUTER_RING = 4;

type ProfileAvatarProps = {
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  onRatingPress?: () => void;
};

export function ProfileAvatar({
  name,
  imageUrl,
  rating,
  reviewCount,
  isOnline,
  onRatingPress,
}: ProfileAvatarProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.outerShell,
          {
            backgroundColor: theme.muted,
            boxShadow: cardShadow(colorScheme),
          },
        ]}>
        <View
          style={[
            styles.innerCore,
            {
              backgroundColor: theme.card,
              boxShadow: softInsetShadow(colorScheme),
            },
          ]}>
          <Image
            source={imageUrl}
            style={styles.avatar}
            contentFit='cover'
            transition={250}
            accessibilityLabel={`${name} profile photo`}
          />
        </View>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isOnline ? theme.online : theme.offline,
              borderColor: theme.card,
            },
          ]}
          accessibilityLabel={isOnline ? 'Available now' : 'Currently away'}
        />
      </View>

      <Pressable
        onPress={onRatingPress}
        disabled={!onRatingPress}
        accessibilityRole={onRatingPress ? 'button' : 'text'}
        accessibilityLabel={
          reviewCount > 0
            ? `Rating ${rating.toFixed(1)} from ${reviewCount} reviews`
            : `Rating ${rating.toFixed(1)}`
        }
        style={({ pressed }) => [
          styles.ratingPill,
          onRatingPress && pressed ? { opacity: 0.75 } : null,
        ]}>
        <Feather name='star' size={13} color='#FFB300' />
        <ThemedText style={styles.ratingValue} selectable>
          {rating.toFixed(1)}
        </ThemedText>
        {reviewCount > 0 ? (
          <ThemedText
            style={[styles.reviewCount, { color: theme.subtext }]}
            selectable>
            ({reviewCount})
          </ThemedText>
        ) : null}
        {onRatingPress ? (
          <Feather name='chevron-right' size={14} color={theme.subtext} />
        ) : null}
      </Pressable>
    </View>
  );
}

function softInsetShadow(scheme: ColorScheme) {
  return scheme === 'light'
    ? 'inset 0 1px 1px rgba(255, 255, 255, 0.9)'
    : 'inset 0 1px 1px rgba(255, 255, 255, 0.08)';
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  outerShell: {
    width: AVATAR_SIZE + OUTER_RING * 2,
    height: AVATAR_SIZE + OUTER_RING * 2,
    borderRadius: (AVATAR_SIZE + OUTER_RING * 2) / 2,
    borderCurve: 'continuous',
    padding: OUTER_RING,
    position: 'relative',
  },
  innerCore: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  statusDot: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderCurve: 'continuous',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reviewCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});
