import { CATEGORIES } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '../themed-text';

export function Categories() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const handleCategoryPress = (slug: string) => {
    router.push({
      pathname: '/(tabs)/services',
      params: { category: slug },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title} type='subtitle'>
          Categories
        </ThemedText>
        <TouchableOpacity onPress={() => handleCategoryPress('')}>
          <ThemedText style={[styles.seeAll, { color: theme.accent }]}>
            Explore All
          </ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(cat.slug)}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme.surface,
                },
              ]}>
              {cat.lottie ? (
                <LottieView
                  autoPlay
                  loop
                  style={{
                    width: 38,
                    height: 38,
                  }}
                  source={cat.lottie}
                />
              ) : (
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={26}
                  color={theme.accent}
                />
              )}
            </View>
            <ThemedText
              numberOfLines={1}
              style={[styles.categoryName, { color: theme.text }]}>
              {cat.name}
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
    width: 80,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Subtle shadow for the icon container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
