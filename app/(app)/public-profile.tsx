import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id]);

  const fetchProvider = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'service_providers', id as string));
      if (docSnap.exists()) {
        setProvider(docSnap.data() as ServiceProvider);
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size='large' color={theme.accent} />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText>Provider not found</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}>
            <Feather name='arrow-left' size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} type='defaultSemiBold'>
            {provider.title || 'Service Provider'}
          </ThemedText>
          <TouchableOpacity style={styles.headerButton}>
            <Feather name='share-2' size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Profile Basic Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  provider.imageUrl ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop'
                }
                style={styles.avatar}
              />
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: provider.isAvailable
                      ? '#4CAF50'
                      : '#FF3B30',
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.providerName} type='title'>
              {provider.name}
            </ThemedText>
            <View style={styles.roleRow}>
              <ThemedText
                style={[styles.providerRole, { color: theme.subtext }]}>
                {provider.professions[0]}
              </ThemedText>
              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: theme.accent },
                ]}>
                <Feather name='check-circle' size={12} color={theme.onAccent} />
                <ThemedText
                  style={[styles.verifiedText, { color: theme.onAccent }]}>
                  Verified
                </ThemedText>
              </View>
            </View>
            <View style={[styles.ratingBadge, { backgroundColor: theme.card }]}>
              <Feather name='star' size={14} color='#FFB800' fill='#FFB800' />
              <ThemedText style={styles.ratingText}>
                {provider.rating.toFixed(1)}{' '}
                <ThemedText
                  style={[styles.reviewCount, { color: theme.subtext }]}>
                  ({provider.reviewCount})
                </ThemedText>
              </ThemedText>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <ThemedText style={styles.statValue}>
                {provider.experienceYears}+
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Years Exp.
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <ThemedText style={styles.statValue}>
                ~{provider.serviceRadius}km
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Service Area
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <ThemedText style={styles.statValue}>
                {provider.languages[0]}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Lang.
              </ThemedText>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='subtitle'>
              About
            </ThemedText>
            <ThemedText style={[styles.sectionBody, { color: theme.text }]}>
              {provider.bio}
            </ThemedText>
          </View>

          {/* Dynamic Services List */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='subtitle'>
              Services Offered
            </ThemedText>
            {provider.services && provider.services.length > 0 ? (
              provider.services.map((service) => (
                <View
                  key={service.id}
                  style={[
                    styles.serviceItem,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}>
                  <View style={styles.serviceItemMain}>
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={styles.serviceItemTitle}
                        type='defaultSemiBold'>
                        {service.title}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.serviceItemPrice,
                          { color: theme.accent },
                        ]}>
                        Rs. {service.minPrice} - Rs. {service.maxPrice}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.bookBtn,
                        { backgroundColor: theme.accent },
                      ]}>
                      <ThemedText
                        style={[styles.bookBtnText, { color: theme.onAccent }]}>
                        Book
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText
                    style={[styles.serviceItemDesc, { color: theme.subtext }]}
                    numberOfLines={2}>
                    {service.description}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={{ color: theme.subtext, fontStyle: 'italic' }}>
                General services available based on profession.
              </ThemedText>
            )}
          </View>

          {/* Portfolio Grid if available */}
          {provider.portfolioUrls && provider.portfolioUrls.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type='subtitle'>
                Recent Work
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioScroll}>
                {provider.portfolioUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={url}
                    style={styles.portfolioThumb}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Sticky Action Bar */}
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: theme.background, borderTopColor: theme.border },
          ]}>
          <TouchableOpacity
            style={[styles.chatBtn, { borderColor: theme.border }]}>
            <Feather name='message-circle' size={20} color={theme.text} />
            <ThemedText style={styles.chatBtnText} type='defaultSemiBold'>
              Chat
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: theme.accent }]}>
            <Feather name='phone-call' size={20} color={theme.onAccent} />
            <ThemedText
              style={[styles.contactBtnText, { color: theme.onAccent }]}
              type='defaultSemiBold'>
              Contact
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  providerName: { fontSize: 22, marginBottom: 4 },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  providerRole: { fontSize: 14 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: { fontSize: 10, color: '#fff', fontWeight: '800' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  ratingText: { fontSize: 15, fontWeight: 'bold' },
  reviewCount: { fontWeight: 'normal', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  sectionBody: { fontSize: 15, lineHeight: 22 },
  serviceItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  serviceItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceItemTitle: { fontSize: 16 },
  serviceItemPrice: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  serviceItemDesc: { fontSize: 13, lineHeight: 18 },
  bookBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  portfolioScroll: { gap: 12 },
  portfolioThumb: { width: 120, height: 120, borderRadius: 12 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
  },
  chatBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  chatBtnText: { fontSize: 16 },
  contactBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  contactBtnText: { fontSize: 16 },
});
