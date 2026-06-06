import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { SearchField } from '@/components/ui/search-field';
import { PROBLEMS } from '@/constants/problems';
import { Layout } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface MapFilterSheetProps {
  selectedProblem: string | null;
  selectedWorkerType: string | null;
  onSelectProblem: (slug: string | null) => void;
  onSelectWorkerType: (name: string | null) => void;
  onClose: () => void;
}

export function MapFilterSheet({
  selectedProblem,
  selectedWorkerType,
  onSelectProblem,
  onSelectWorkerType,
  onClose,
}: MapFilterSheetProps) {
  const theme = useTheme();
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

  const clearAll = () => {
    onSelectProblem(null);
    onSelectWorkerType(null);
    onClose();
  };

  type FilterItem = (typeof WORKER_TYPES)[number] | (typeof PROBLEMS)[number];

  const renderItem = ({ item }: { item: FilterItem }) => {
    const isSelected =
      activeTab === 'professions'
        ? selectedWorkerType === item.name
        : selectedProblem === ('slug' in item ? item.slug : null);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemRow,
          {
            borderBottomColor: theme.border,
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
  };

  return (
    <View style={styles.container}>
      <BottomSheetHeader
        title='Search & Filter'
        actionLabel='Clear'
        onAction={clearAll}
      />

      <View
        style={[
          styles.tabContainer,
          { backgroundColor: theme.muted, borderColor: theme.border },
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

      <BottomSheetFlatList
        data={filteredData}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    borderWidth: 1,
    marginBottom: 12,
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
  searchWrap: { marginBottom: 8 },
  listContent: { paddingBottom: 40 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
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
