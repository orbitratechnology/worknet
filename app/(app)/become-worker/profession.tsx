import {
  WizardFooter,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { SearchField } from '@/components/ui/search-field';
import { WORKER_TYPES } from '@/constants/worker-types';
import { Layout, chipBorderWidth, getSurfaceStyle } from '@/constants/theme';
import { useRequireWorkerIdentity } from '@/hooks/use-require-worker-identity';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

export default function ProfessionStep() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorSchemeMode();
  useRequireWorkerIdentity();
  const { draft, updateDraft, loaded } = useWorkerOnboarding();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(draft.primaryProfessionId);

  useEffect(() => {
    if (loaded && draft.primaryProfessionId) {
      setSelectedId(draft.primaryProfessionId);
    }
  }, [loaded, draft.primaryProfessionId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return WORKER_TYPES;
    return WORKER_TYPES.filter((w) => w.name.toLowerCase().includes(q));
  }, [search]);

  const next = async () => {
    const worker = WORKER_TYPES.find((w) => w.id === selectedId);
    if (!worker) return;
    await updateDraft({
      primaryProfessionId: worker.id,
      primaryProfession: worker.name,
    });
    router.push('/(app)/become-worker/location');
  };

  return (
    <WizardScreen
      step={4}
      total={7}
      title='Your profession'
      scrollable={false}
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!selectedId}
        />
      }>
      <View style={styles.searchWrap}>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder='Search professions…'
        />
      </View>

      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        renderItem={({ item }) => {
          const selected = selectedId === item.id;
          return (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedId(item.id);
                updateDraft({
                  primaryProfessionId: item.id,
                  primaryProfession: item.name,
                });
              }}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: selected ? theme.accent : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                  borderWidth: chipBorderWidth(scheme, selected),
                  ...(selected ? {} : getSurfaceStyle(scheme, 'soft')),
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: selected
                      ? theme.onAccent + '20'
                      : theme.muted,
                  },
                ]}>
                <MaterialCommunityIcons
                  name={item.icon as never}
                  size={20}
                  color={selected ? theme.onAccent : theme.text}
                />
              </View>
              <ThemedText
                style={[
                  styles.rowText,
                  { color: selected ? theme.onAccent : theme.text },
                ]}>
                {item.name}
              </ThemedText>
              {selected ? (
                <Feather name='check' size={18} color={theme.onAccent} />
              ) : null}
            </Pressable>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedText
            style={[styles.empty, { color: theme.subtext }]}>
            No professions match your search.
          </ThemedText>
        }
      />
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, width: '100%' },
  searchWrap: { width: '100%' },
  listContent: { gap: Layout.itemGap, paddingBottom: Layout.blockGap },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.blockGap,
    paddingHorizontal: Layout.blockGap,
    paddingVertical: 14,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    minHeight: Layout.fieldHeight,
    width: '100%',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', paddingVertical: Layout.sectionGap, fontSize: 15 },
});
