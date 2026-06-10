import { ThemedText } from '@/components/themed-text';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { PROBLEMS } from '@/constants/problems';
import { cardShadow, Layout, type ColorScheme } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

type Tab = 'problems' | 'workers';
type ProblemItem = (typeof PROBLEMS)[number];
type WorkerItem = (typeof WORKER_TYPES)[number];
type ExploreItem = ProblemItem | WorkerItem;

function isProblemItem(item: ExploreItem): item is ProblemItem {
  return 'slug' in item;
}

function getItemSubtitle(item: ExploreItem): string {
  return isProblemItem(item) ? 'Problem' : 'Professional';
}

export default function ExploreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { contentBottom } = useScreenInsets();
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const [activeTab, setActiveTab] = useState<Tab>('problems');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo((): ExploreItem[] => {
    const query = searchQuery.toLowerCase().trim();
    if (activeTab === 'problems') {
      if (!query) return PROBLEMS;
      return PROBLEMS.filter((p) => p.name.toLowerCase().includes(query));
    }
    if (!query) return WORKER_TYPES;
    return WORKER_TYPES.filter((w) => w.name.toLowerCase().includes(query));
  }, [activeTab, searchQuery]);

  const handleItemPress = useCallback(
    (item: ExploreItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isProblemItem(item)) {
        router.push({
          pathname: '/(tabs)/services',
          params: { problem: item.slug },
        });
        return;
      }
      router.push({
        pathname: '/(tabs)/services',
        params: { professionId: item.id },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ExploreItem }) => (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.card,
            boxShadow: cardShadow(colorScheme),
            opacity: pressed ? 0.92 : 1,
          },
        ]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.muted }]}>
          <MaterialCommunityIcons
            name={
              item.icon as React.ComponentProps<
                typeof MaterialCommunityIcons
              >['name']
            }
            size={26}
            color={theme.text}
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.itemName} type='defaultSemiBold' selectable>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.categoryName, { color: theme.subtext }]}>
            {getItemSubtitle(item)}
          </ThemedText>
        </View>
        <View style={[styles.chevronWrap, { backgroundColor: theme.muted }]}>
          <Feather name='chevron-right' size={16} color={theme.text} />
        </View>
      </Pressable>
    ),
    [colorScheme, handleItemPress, theme],
  );

  const listEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Feather name='search' size={48} color={theme.border} />
        <ThemedText style={styles.emptyTitle} selectable>
          No exact matches
        </ThemedText>
        <ThemedText
          style={[styles.emptySub, { color: theme.subtext }]}
          selectable>
          Try a more general search term
        </ThemedText>
      </View>
    ),
    [theme.border, theme.subtext],
  );

  return (
    <ScreenShell>
      <StackHeader title='Explore' />

      <View style={styles.searchWrap}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            activeTab === 'problems'
              ? 'Describe your problem...'
              : 'Find a professional...'
          }
        />
      </View>

      <View style={styles.tabsWrap}>
        <SegmentedTabs
          tabs={[
            { key: 'problems', label: 'Problems' },
            { key: 'workers', label: 'Worker Roles' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: contentBottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={listEmptyComponent}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Layout.itemGap,
  },
  tabsWrap: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap - 8,
  },
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.itemGap,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
