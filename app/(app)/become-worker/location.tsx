import {
  WizardFooter,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout } from '@/constants/theme';
import { useRequireWorkerIdentity } from '@/hooks/use-require-worker-identity';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import {
  useFieldStyle,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { getGeohash } from '@/lib/geo';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function LocationStep() {
  const router = useRouter();
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const surfaceStyle = useSurfaceStyle();
  useRequireWorkerIdentity();
  const { draft, updateDraft, loaded } = useWorkerOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [region, setRegion] = useState({
    latitude: draft.latitude ?? 6.9271,
    longitude: draft.longitude ?? 79.8612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [marker, setMarker] = useState({
    latitude: draft.latitude ?? 6.9271,
    longitude: draft.longitude ?? 79.8612,
  });
  const [city, setCity] = useState(draft.homeCity);

  useEffect(() => {
    if (!loaded) return;
    if (draft.latitude != null && draft.longitude != null) {
      setMarker({ latitude: draft.latitude, longitude: draft.longitude });
      setRegion((r) => ({
        ...r,
        latitude: draft.latitude!,
        longitude: draft.longitude!,
      }));
    }
    if (draft.homeCity) setCity(draft.homeCity);
  }, [loaded, draft.latitude, draft.longitude, draft.homeCity]);

  const persistLocation = (
    lat: number,
    lng: number,
    nextCity: string,
  ) => {
    updateDraft({
      latitude: lat,
      longitude: lng,
      homeCity: nextCity,
      country: draft.country || 'Sri Lanka',
    });
  };

  const useCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setMarker({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setRegion((r) => ({
        ...r,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }));
      const nextCity = geo?.city || geo?.district || geo?.subregion || 'Colombo';
      setCity(nextCity);
      persistLocation(loc.coords.latitude, loc.coords.longitude, nextCity);
    } catch {
      setError('Could not get location. Tap the map to set your pin.');
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    if (!city.trim()) {
      setError('Set your location on the map.');
      return;
    }
    await updateDraft({
      latitude: marker.latitude,
      longitude: marker.longitude,
      homeCity: city,
      country: 'Sri Lanka',
    });
    router.push('/(app)/become-worker/details');
  };

  return (
    <WizardScreen
      step={5}
      total={7}
      title='Your location'
      scrollable={false}
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!city.trim()}
        />
      }>
      <HapticPressable
        onPress={useCurrentLocation}
        style={({ pressed }) => [
          styles.gpsBtn,
          {
            borderColor: theme.border,
            backgroundColor: theme.surface,
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          fieldStyle,
        ]}>
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <>
            <Feather name='navigation' size={16} color={theme.text} />
            <ThemedText style={styles.gpsText}>Use current location</ThemedText>
          </>
        )}
      </HapticPressable>

      <View
        style={[styles.mapWrap, { borderColor: theme.border }, surfaceStyle]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          region={region}
          onPress={(e) => {
            const coord = e.nativeEvent.coordinate;
            setMarker(coord);
            persistLocation(coord.latitude, coord.longitude, city);
          }}>
          <Marker
            coordinate={marker}
            draggable
            onDragEnd={(e) => {
              const coord = e.nativeEvent.coordinate;
              setMarker(coord);
              persistLocation(coord.latitude, coord.longitude, city);
            }}
          />
        </MapView>
      </View>

      {city ? (
        <View style={styles.cityRow}>
          <Feather name='map-pin' size={16} color={theme.text} />
          <ThemedText style={styles.cityLabel}>
            {city} · {getGeohash(marker.latitude, marker.longitude).slice(0, 6)}…
          </ThemedText>
        </View>
      ) : null}

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
      ) : null}
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    minHeight: Layout.fieldHeight,
    width: '100%',
  },
  gpsText: { fontSize: 16, fontWeight: '600' },
  mapWrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
    width: '100%',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 4,
  },
  cityLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  error: { fontSize: 14, lineHeight: 20 },
});
