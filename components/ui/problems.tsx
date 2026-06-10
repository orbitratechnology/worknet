import {
  EMERGENCY_PROBLEMS,
  FEATURED_PROBLEMS,
} from '@/constants/featured-problems';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { SectionHeader } from './section-header';

function ProblemChip({
  name,
  icon,
  slug,
  onPress,
}: {
  name: string;
  icon: string;
  slug: string;
  onPress: (slug: string) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress(slug)}
      style={({ pressed }) => [
        styles.categoryItem,
        { opacity: pressed ? 0.85 : 1 },
      ]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={26}
          color={theme.text}
        />
      </View>
      <ThemedText
        numberOfLines={2}
        style={[styles.categoryName, { color: theme.text }]}>
        {name.split(' / ')[0]}
      </ThemedText>
    </Pressable>
  );
}

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

      <ThemedText style={[styles.emergencyLabel, { color: theme.error }]}>
        Emergency
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'>
        {EMERGENCY_PROBLEMS.map((prob) => (
          <ProblemChip
            key={prob.id}
            name={prob.name}
            icon={prob.icon}
            slug={prob.slug}
            onPress={handleProblemPress}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'>
        {FEATURED_PROBLEMS.map((prob) => (
          <ProblemChip
            key={prob.id}
            name={prob.name}
            icon={prob.icon}
            slug={prob.slug}
            onPress={handleProblemPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.sectionGap,
  },
  emergencyLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: 20,
    marginBottom: 12,
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
