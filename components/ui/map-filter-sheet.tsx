import { RADIUS_OPTIONS_KM } from '@/constants/search-defaults';
import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { RadiusChips } from '@/components/ui/radius-chips';
import { SearchField } from '@/components/ui/search-field';
import { PROBLEMS } from '@/constants/problems';
import { getFieldStyle, Layout } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface MapFilterSheetProps {
  selectedProblem: string | null;
  selectedWorkerType: string | null;
  distanceKm: number;
  onDistanceChange: (km: number) => void;
  onSelectProblem: (slug: string | null) => void;
  onSelectWorkerType: (name: string | null) => void;
  onClose: () => void;
}

export function MapFilterSheet({
  selectedProblem,
  selectedWorkerType,
  distanceKm,
  onDistanceChange,
  onSelectProblem,
  onSelectWorkerType,
  onClose,
}: MapFilterSheetProps) {
  const theme = useTheme();
  const scheme = useColorSchemeMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'professions' | 'problems'>(
    'professions',
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (activeTab === 'professions') {
      return WORKER_TYPES.filter((type) =>
        type.name.toLowerCase().includes(query),
      );
    }
    return PROBLEMS.filter((prob) => prob.name.toLowerCase().includes(query));
  }, [searchQuery, activeTab]);

  const clearAll = useCallback(() => {
    onSelectProblem(null);
    onSelectWorkerType(null);
    onClose();
  }, [onSelectProblem, onSelectWorkerType, onClose]);

  type FilterItem = (typeof WORKER_TYPES)[number] | (typeof PROBLEMS)[number];

  const renderItem = useCallback(
    ({ item }: { item: FilterItem }) => {
      const isSelected =
        activeTab === 'professions'
          ? selectedWorkerType === item.name
          : selectedProblem === ('slug' in item ? item.slug : null);

      return (
        <Pressable
          style={({ pressed }) => [
            styles.itemRow,
            {
              borderBottomColor: theme.divider,
              backgroundColor: isSelected ? theme.muted : 'transparent',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            if (activeTab === 'professions') {
              onSelectWorkerType(isSelected ? null : item.name);
            } else if ('slug' in item) {
              onSelectProblem(isSelected ? null : item.slug);
            }
            onClose();
          }}>
          <View style={styles.itemLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: (item.color ?? theme.accent) + '20' },
              ]}>
              <MaterialCommunityIcons
                name={item.icon as never}
                size={20}
                color={item.color || theme.accent}
              />
            </View>
            <ThemedText style={styles.itemText}>{item.name}</ThemedText>
          </View>
          {isSelected ? (
            <Feather name='check' size={20} color={theme.accent} />
          ) : null}
        </Pressable>
      );
    },
    [
      activeTab,
      onClose,
      onSelectProblem,
      onSelectWorkerType,
      selectedProblem,
      selectedWorkerType,
      theme,
    ],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContent}>
        <BottomSheetHeader
          title='Search & Filter'
          actionLabel='Clear'
          onAction={clearAll}
        />

        <View style={styles.distanceSection}>
          <View style={styles.distanceHeader}>
            <ThemedText style={styles.distanceTitle} type='defaultSemiBold'>
              Distance
            </ThemedText>
            <View
              style={[styles.distanceBadge, { backgroundColor: theme.muted }]}>
              <ThemedText style={styles.distanceBadgeText}>
                {distanceKm} km
              </ThemedText>
            </View>
          </View>
          <RadiusChips
            value={distanceKm}
            onChange={onDistanceChange}
            compact
          />
          <ThemedText style={[styles.distanceHint, { color: theme.subtext }]}>
            Within {RADIUS_OPTIONS_KM[0]}–
            {RADIUS_OPTIONS_KM[RADIUS_OPTIONS_KM.length - 1]} km of search area
          </ThemedText>
        </View>

        <View
          style={[
            styles.tabContainer,
            { backgroundColor: theme.muted },
            getFieldStyle(scheme),
          ]}>
          {(['professions', 'problems'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[
                  styles.tab,
                  active && { backgroundColor: theme.accent },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab);
                  setSearchQuery('');
                }}>
                <ThemedText
                  style={[
                    styles.tabText,
                    { color: active ? theme.onAccent : theme.text },
                  ]}>
                  {tab === 'professions' ? 'Professions' : 'Problems'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchWrap}>
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search ${activeTab}…`}
          />
        </View>
      </View>
    ),
    [
      activeTab,
      clearAll,
      distanceKm,
      onDistanceChange,
      searchQuery,
      theme,
    ],
  );

  return (
    <BottomSheetFlatList<FilterItem>
      data={filteredData}
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
  headerContent: {},
  listContent: {
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    marginBottom: 12,
    marginHorizontal: Layout.screenPadding,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius - 4,
    borderCurve: 'continuous',
    alignItems: 'center',
    minHeight: Layout.minTouch - 4,
    justifyContent: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  distanceSection: {
    marginBottom: 16,
    paddingHorizontal: Layout.screenPadding,
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceTitle: {
    fontSize: 16,
  },
  distanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distanceHint: {
    fontSize: 12,
    marginTop: 8,
  },
  searchWrap: {
    marginBottom: 8,
    paddingHorizontal: Layout.screenPadding,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Layout.screenPadding + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Layout.minTouch + 4,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: { fontSize: 16, flex: 1, fontWeight: '500' },
});
