import { Colors } from '@/constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';

export interface ServiceCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  imageUrl: string;
}

export const ServiceCard = React.memo(function ServiceCard({
  id,
  name,
  category,
  rating,
  distance,
  imageUrl,
}: ServiceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = React.useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [scale]);

  const handlePressOut = React.useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [scale]);

  const handlePress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(app)/public-profile',
      params: { id },
    });
  }, [id, router]);

  const defaultAvatar = React.useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=000000&color=FFFFFF&bold=true`,
    [name]
  );

  return (
    <Animated.View
      style={[styles.containerWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
            shadowOpacity: colorScheme === 'light' ? 0.04 : 0.2,
          },
        ]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || defaultAvatar }}
            style={styles.image}
            contentFit='cover'
            transition={300}
          />
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: 'rgba(15, 23, 42, 0.75)' },
              ]}>
              <Ionicons name='star' size={10} color={theme.gold} />
              <ThemedText style={styles.ratingText}>
                {rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          <ThemedText
            style={styles.name}
            type='defaultSemiBold'
            numberOfLines={1}>
            {name}
          </ThemedText>
          <ThemedText
            style={[styles.category, { color: theme.subtext }]}
            numberOfLines={1}>
            {category}
          </ThemedText>

          <View style={styles.footer}>
            <View style={styles.distanceContainer}>
              <Feather name='navigation' size={10} color={theme.accent} />
              <ThemedText
                style={[styles.distanceText, { color: theme.subtext }]}>
                {distance}
              </ThemedText>
            </View>
            <View
              style={[
                styles.actionTag,
                { backgroundColor: theme.accent + '10' },
              ]}>
              <ThemedText style={[styles.actionText, { color: theme.accent }]}>
                View
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  containerWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  container: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  details: {
    padding: 12,
    gap: 2,
  },
  name: {
    fontSize: 15,
    letterSpacing: -0.3,
  },
  category: {
    fontSize: 12,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
