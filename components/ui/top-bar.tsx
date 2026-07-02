import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { LocationPickerSheet } from '@/components/ui/location-picker-sheet';
import { Layout } from '@/constants/theme';
import { useLocation } from '@/context/location';
import { useSearchLocation } from '@/context/search-location';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

export function TopBar() {
  const theme = useTheme();
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
      <View style={styles.container}>
        <View
          style={styles.logoWrap}
          accessibilityRole='image'
          accessibilityLabel='Worknet'>
          <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={styles.logoImage}
            contentFit='contain'
          />
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            pickerRef.current?.present();
          }}
          style={({ pressed }) => [
            styles.locationRow,
            { opacity: pressed ? 0.75 : 1 },
          ]}
          accessibilityRole='button'
          accessibilityLabel={
            gpsLoading && !searchOrigin
              ? 'Loading location'
              : `Search location: ${locationLine}`
          }>
          {gpsLoading && !searchOrigin ? (
            <ActivityIndicator size='small' color={theme.text} />
          ) : (
            <>
              <Feather name='map-pin' size={16} color={theme.text} />
              <ThemedText
                style={styles.locationText}
                type='headline'
                numberOfLines={1}>
                {locationLine}
              </ThemedText>
              <Feather name='chevron-down' size={18} color={theme.text} />
            </>
          )}
        </Pressable>
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
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 4,
    paddingBottom: Layout.blockGap,
    backgroundColor: 'transparent',
  },
  logoWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: Layout.minTouch,
    maxWidth: '62%',
    flexShrink: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
});
