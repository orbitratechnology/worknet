import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { LocationPickerSheet } from '@/components/ui/location-picker-sheet';
import { SearchField } from '@/components/ui/search-field';
import { Layout } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { useSearchLocation } from '@/context/search-location';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

type HomeScreenHeaderProps = {
  topInset: number;
  bannerColor: string;
  onSearchPress: () => void;
  searchPlaceholder?: string;
};

export function HomeScreenHeader({
  topInset,
  bannerColor,
  onSearchPress,
  searchPlaceholder = 'Search for "Welder" or "Broken Tap"...',
}: HomeScreenHeaderProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const bannerForeground =
    colorScheme === 'light' ? theme.onAccent : theme.background;
  const bannerEyebrow =
    colorScheme === 'light'
      ? 'rgba(255, 255, 255, 0.72)'
      : 'rgba(10, 10, 10, 0.65)';
  const { loading: gpsLoading } = useLocation();
  const {
    searchOrigin,
    radiusKm,
    loaded,
    setSearchOrigin,
    resetToCurrentLocation,
  } = useSearchLocation();
  const pickerRef = useRef<BottomSheetModal>(null);

  const label = searchOrigin?.label || 'Set location';
  const locationLine =
    loaded && searchOrigin ? `${label} · ${radiusKm} km` : label;

  const handleSelectArea = (area: {
    latitude: number;
    longitude: number;
    name: string;
  }) => {
    setSearchOrigin({
      latitude: area.latitude,
      longitude: area.longitude,
      label: area.name,
      source: 'area',
    });
  };

  return (
    <>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: bannerColor,
            paddingTop: topInset + 10,
          },
        ]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            pickerRef.current?.present();
          }}
          style={({ pressed }) => [
            styles.locationBlock,
            { opacity: pressed ? 0.82 : 1 },
          ]}
          accessibilityRole='button'
          accessibilityLabel={
            gpsLoading && !searchOrigin
              ? 'Loading location'
              : `Search location: ${locationLine}`
          }>
          <ThemedText style={[styles.locationEyebrow, { color: bannerEyebrow }]}>
            Searching near
          </ThemedText>
          {gpsLoading && !searchOrigin ? (
            <ActivityIndicator size='small' color={bannerForeground} />
          ) : (
            <View style={styles.locationRow}>
              <Feather name='map-pin' size={16} color={bannerForeground} />
              <ThemedText
                style={[styles.locationText, { color: bannerForeground }]}
                numberOfLines={1}>
                {locationLine}
              </ThemedText>
              <Feather name='chevron-down' size={18} color={bannerForeground} />
            </View>
          )}
        </Pressable>

        <View style={styles.searchWrap}>
          <SearchField
            variant='header'
            placeholder={searchPlaceholder}
            onPress={onSearchPress}
            editable={false}
          />
        </View>
      </View>

      <AppBottomSheet ref={pickerRef} snapPoints={['75%', '90%']} scrollable>
        <LocationPickerSheet
          searchOrigin={searchOrigin}
          onClose={() => pickerRef.current?.dismiss()}
          onSelectArea={handleSelectArea}
          onResetToCurrentLocation={resetToCurrentLocation}
        />
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderCurve: 'continuous',
    gap: 16,
    marginBottom: Layout.sectionGap - 8,
  },
  locationBlock: {
    gap: 4,
  },
  locationEyebrow: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  searchWrap: {
    width: '100%',
  },
});
