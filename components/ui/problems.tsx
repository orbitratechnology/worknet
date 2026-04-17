import { PROBLEMS } from '@/constants/problems';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';

export function Problems() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const handleProblemPress = (slug: string) => {
    if (slug === 'explore') {
      router.push('/explore');
    } else {
      router.push({
        pathname: '/(tabs)/services',
        params: { problem: slug },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title} type='subtitle'>
          How can we help?
        </ThemedText>
        <TouchableOpacity onPress={() => handleProblemPress('explore')}>
          <ThemedText style={[styles.seeAll, { color: theme.accent }]}>
            All Problems
          </ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'>
        {PROBLEMS.map((prob) => (
          <TouchableOpacity
            key={prob.id}
            activeOpacity={1}
            style={styles.categoryItem}
            onPress={() => handleProblemPress(prob.slug)}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme.surface,
                },
              ]}>
              <View
                style={[
                  styles.iconInner,
                  { backgroundColor: prob.color + '15' },
                ]}>
                <MaterialCommunityIcons
                  name={prob.icon as any}
                  size={32}
                  color={prob.color || theme.accent}
                />
              </View>
            </View>
            <ThemedText
              numberOfLines={2}
              style={[styles.categoryName, { color: theme.text }]}>
              {prob.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 100,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
