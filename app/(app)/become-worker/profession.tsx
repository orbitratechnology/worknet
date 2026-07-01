import {
  WizardFooter,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { SearchField } from '@/components/ui/search-field';
import { WORKER_TYPES } from '@/constants/worker-types';
import { Layout } from '@/constants/theme';
import { useRequireWorkerIdentity } from '@/hooks/use-require-worker-identity';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

export default function ProfessionStep() {
  const router = useRouter();
  const theme = useTheme();
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
      <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
        Choose the skill customers will search for.
      </ThemedText>

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
                  opacity: pressed ? 0.9 : 1,
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
  list: { flex: 1 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  searchWrap: { marginBottom: 4 },
  listContent: { gap: 8, paddingBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Layout.chipRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    minHeight: Layout.minTouch + 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600' },
  empty: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },
});
