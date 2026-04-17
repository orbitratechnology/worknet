import { PROBLEMS } from '@/constants/problems';
import { Colors } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

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
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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
    } else {
      return PROBLEMS.filter((prob) => prob.name.toLowerCase().includes(query));
    }
  }, [searchQuery, activeTab]);

  const renderItem = ({ item }: { item: any }) => {
    const isSelected =
      activeTab === 'professions'
        ? selectedWorkerType === item.name
        : selectedProblem === item.slug;

    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          { borderBottomColor: theme.border },
          isSelected && { backgroundColor: theme.accent + '15' },
        ]}
        onPress={() => {
          if (activeTab === 'professions') {
            onSelectWorkerType(isSelected ? null : item.name);
          } else {
            onSelectProblem(isSelected ? null : item.slug);
          }
          onClose();
        }}>
        <View style={styles.itemLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + '20' },
            ]}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={20}
              color={item.color || theme.accent}
            />
          </View>
          <ThemedText style={styles.itemText}>{item.name}</ThemedText>
        </View>
        {isSelected && <Feather name='check' size={20} color={theme.accent} />}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type='defaultSemiBold' style={styles.title}>
          Search & Filter
        </ThemedText>
        <TouchableOpacity
          onPress={() => {
            onSelectProblem(null);
            onSelectWorkerType(null);
            onClose();
          }}>
          <ThemedText style={{ color: theme.accent }}>Clear All</ThemedText>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.tabContainer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'professions' && { backgroundColor: theme.accent },
          ]}
          onPress={() => setActiveTab('professions')}>
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'professions' && { color: theme.onAccent },
            ]}>
            Professions
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'problems' && { backgroundColor: theme.accent },
          ]}
          onPress={() => setActiveTab('problems')}>
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'problems' && { color: theme.onAccent },
            ]}>
            Problems
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <Feather name='search' size={20} color={theme.subtext} />
        <TextInput
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor={theme.subtext}
          style={[styles.searchInput, { color: theme.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name='x-circle' size={18} color={theme.subtext} />
          </TouchableOpacity>
        )}
      </View>

      <BottomSheetFlatList
        data={filteredData}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  title: { fontSize: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  listContent: { paddingBottom: 40 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: { fontSize: 16, flex: 1 },
});
