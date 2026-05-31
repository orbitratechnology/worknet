import { PROBLEMS } from '@/constants/problems';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { SectionHeader } from './section-header';

export function Problems() {
  const theme = useTheme();
  const router = useRouter();

  const handleProblemPress = (slug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (slug === 'explore') {
      router.push('/(app)/explore');
    } else {
      router.push({
        pathname: '/(tabs)/services',
        params: { problem: slug },
      });
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title='What do you need?'
        onActionPress={() => handleProblemPress('explore')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'>
        {PROBLEMS.map((prob) => (
          <Pressable
            key={prob.id}
            onPress={() => handleProblemPress(prob.slug)}
            style={({ pressed }) => [
              styles.categoryItem,
              { opacity: pressed ? 0.85 : 1 },
            ]}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <MaterialCommunityIcons
                name={prob.icon as any}
                size={26}
                color={theme.text}
              />
            </View>
            <ThemedText
              numberOfLines={2}
              style={[styles.categoryName, { color: theme.text }]}>
              {prob.name.split(' / ')[0]}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.sectionGap,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: 20,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
    gap: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
