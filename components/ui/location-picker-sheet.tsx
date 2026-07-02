import { ThemedText } from '@/components/themed-text';
import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { SearchField } from '@/components/ui/search-field';
import type { SriLankaArea } from '@/constants/sri-lanka-areas';
import { Layout } from '@/constants/theme';
import { useFieldStyle } from '@/hooks/use-surface-style';
import type { SearchOrigin } from '@/context/search-location';
import { useTheme } from '@/hooks/use-theme';
import { filterAreas } from '@/lib/search-areas';
import { Feather } from '@expo/vector-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface LocationPickerSheetProps {
  searchOrigin: SearchOrigin | null;
  onClose: () => void;
  onSelectArea: (area: SriLankaArea) => void;
  onResetToCurrentLocation: () => Promise<void>;
}

export function LocationPickerSheet({
  searchOrigin,
  onClose,
  onSelectArea,
  onResetToCurrentLocation,
}: LocationPickerSheetProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const areas = useMemo(() => filterAreas(query), [query]);

  const handleUseGps = useCallback(async () => {
    setGpsLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onResetToCurrentLocation();
      onClose();
    } finally {
      setGpsLoading(false);
    }
  }, [onResetToCurrentLocation, onClose]);

  const handleSelectArea = useCallback(
    (area: SriLankaArea) => {
      Haptics.selectionAsync();
      onSelectArea(area);
      onClose();
    },
    [onSelectArea, onClose],
  );

  const handleChooseOnMap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push({ pathname: '/(tabs)/map', params: { pickSearchOrigin: '1' } });
  }, [onClose, router]);

  const renderItem = useCallback(
    ({ item }: { item: SriLankaArea }) => {
      const selected = searchOrigin?.label === item.name;
      return (
        <Pressable
          onPress={() => handleSelectArea(item)}
          style={({ pressed }) => [
            styles.areaRow,
            {
              borderBottomColor: theme.divider,
              backgroundColor: selected ? theme.muted : 'transparent',
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <View style={styles.areaLeft}>
            <View style={[styles.areaIcon, { backgroundColor: theme.muted }]}>
              <Feather name='map-pin' size={16} color={theme.accent} />
            </View>
            <View style={styles.areaText}>
              <ThemedText style={styles.areaName}>{item.name}</ThemedText>
              <ThemedText
                style={[styles.areaDistrict, { color: theme.subtext }]}>
                {item.district} District
              </ThemedText>
            </View>
          </View>
          {selected ? (
            <Feather name='check' size={18} color={theme.accent} />
          ) : null}
        </Pressable>
      );
    },
    [handleSelectArea, searchOrigin?.label, theme],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContent}>
        <BottomSheetHeader
          title='Search location'
          actionLabel='Done'
          onAction={onClose}
        />

        <HapticPressable
          onPress={handleUseGps}
          disabled={gpsLoading}
          style={({ pressed }) => [
            styles.gpsBtn,
            fieldStyle,
            {
              backgroundColor: theme.muted,
              opacity: pressed || gpsLoading ? 0.85 : 1,
            },
          ]}>
          {gpsLoading ? (
            <ActivityIndicator size='small' color={theme.accent} />
          ) : (
            <Feather name='crosshair' size={18} color={theme.accent} />
          )}
          <ThemedText style={styles.gpsBtnText}>Use current location</ThemedText>
        </HapticPressable>

        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder='Search city or town…'
          />
        </View>

        <HapticPressable
          onPress={handleChooseOnMap}
          style={({ pressed }) => [
            styles.mapBtn,
            fieldStyle,
            { opacity: pressed ? 0.85 : 1 },
          ]}>
          <Feather name='map' size={16} color={theme.text} />
          <ThemedText style={styles.mapBtnText}>Choose on map</ThemedText>
        </HapticPressable>
      </View>
    ),
    [gpsLoading, handleChooseOnMap, handleUseGps, onClose, query, theme],
  );

  return (
    <BottomSheetFlatList<SriLankaArea>
      data={areas}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.listContent}
      style={styles.list}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps='handled'
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  headerContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  listContent: {
    paddingBottom: 40,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: Layout.minTouch,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    marginBottom: 12,
  },
  gpsBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  searchWrap: {
    marginBottom: 8,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 40,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    marginBottom: 8,
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Layout.screenPadding + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Layout.minTouch + 4,
  },
  areaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  areaText: {
    flex: 1,
    gap: 2,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
  },
  areaDistrict: {
    fontSize: 13,
  },
});
