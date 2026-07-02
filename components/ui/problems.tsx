import {
  FEATURED_PROBLEMS,
  HOME_EMERGENCY_PROBLEMS,
} from '@/constants/featured-problems';
import { Layout, getSurfaceStyle } from '@/constants/theme';
import { useColorSchemeMode } from '@/hooks/use-surface-style';
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
  urgent,
  onPress,
}: {
  name: string;
  icon: string;
  slug: string;
  urgent?: boolean;
  onPress: (slug: string) => void;
}) {
  const theme = useTheme();
  const scheme = useColorSchemeMode();
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
          getSurfaceStyle(scheme, 'soft'),
          {
            backgroundColor: urgent
              ? scheme === 'light'
                ? theme.error + '12'
                : theme.card
              : theme.card,
          },
        ]}>
        <MaterialCommunityIcons
          name={icon as never}
          size={28}
          color={urgent ? theme.error : theme.text}
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

function useProblemNavigation() {
  const router = useRouter();

  return React.useCallback(
    (slug: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (slug === 'explore') {
        router.push('/(app)/explore');
      } else {
        router.push({
          pathname: '/(tabs)/services',
          params: { problem: slug },
        });
      }
    },
    [router],
  );
}

export function EmergencyProblems() {
  const theme = useTheme();
  const handleProblemPress = useProblemNavigation();

  return (
    <View style={styles.sectionGroup}>
      <SectionHeader title='Emergency' />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'>
        {HOME_EMERGENCY_PROBLEMS.map((prob) => (
          <ProblemChip
            key={prob.id}
            name={prob.name}
            icon={prob.icon}
            slug={prob.slug}
            urgent
            onPress={handleProblemPress}
          />
        ))}
      </ScrollView>
      <View
        style={[styles.sectionDivider, { backgroundColor: theme.divider }]}
      />
    </View>
  );
}

export function PopularServices() {
  const handleProblemPress = useProblemNavigation();

  return (
    <View style={styles.sectionGroup}>
      <SectionHeader
        title='Popular services'
        onActionPress={() => handleProblemPress('explore')}
      />
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

/** @deprecated Use EmergencyProblems + PopularServices for layout control */
export function Problems() {
  return (
    <View style={styles.container}>
      <EmergencyProblems />
      <PopularServices />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.sectionGap,
    gap: Layout.sectionGap,
  },
  sectionGroup: {
    gap: Layout.blockGap,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Layout.screenPadding,
    marginTop: Layout.sectionGap,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.itemGap + 4,
  },
  categoryItem: {
    alignItems: 'center',
    width: 76,
    gap: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
});
