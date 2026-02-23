import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PROBLEMS } from '@/constants/problems';
import { Colors } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'problems' | 'workers';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('problems');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (activeTab === 'problems') {
      if (!query) return PROBLEMS;
      return PROBLEMS.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    } else {
      if (!query) return WORKER_TYPES;
      return WORKER_TYPES.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.category.toLowerCase().includes(query)
      );
    }
  }, [activeTab, searchQuery]);

  const handleItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeTab === 'problems') {
      router.push({
        pathname: '/(tabs)/services',
        params: { problem: item.slug },
      });
    } else {
      router.push({
        pathname: '/(tabs)/services',
        params: { category: item.category, searchText: item.name },
      });
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      layout={Layout.springify()}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.color + '15' },
          ]}>
          <MaterialCommunityIcons
            name={item.icon as any}
            size={32}
            color={item.color || theme.accent}
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.itemName} type='defaultSemiBold'>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.categoryName, { color: theme.subtext }]}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </ThemedText>
        </View>
        <Feather name='arrow-right' size={18} color={theme.border} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}>
            <Feather name='arrow-left' size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} type='title'>
            Explore
          </ThemedText>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.searchContainer}>
          <View
            style={[
              styles.searchField,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <Feather name='search' size={20} color={theme.accent} />
            <TextInput
              placeholder={
                activeTab === 'problems'
                  ? 'Describe your problem...'
                  : 'Find a professional...'
              }
              placeholderTextColor={theme.subtext}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name='x-circle' size={18} color={theme.subtext} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Tabs */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.tabContainer}>
          {(['problems', 'workers'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab);
              }}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: theme.accent },
              ]}>
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? theme.accent : theme.subtext },
                  activeTab === tab && { fontWeight: '800' },
                ]}>
                {tab === 'problems' ? 'Problems' : 'Worker Roles'}
              </ThemedText>
            </Pressable>
          ))}
        </Animated.View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name='search' size={48} color={theme.border} />
              <ThemedText style={styles.emptyTitle}>
                No exact matches
              </ThemedText>
              <ThemedText style={[styles.emptySub, { color: theme.subtext }]}>
                Try a more general search term
              </ThemedText>
            </View>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
  },
});
