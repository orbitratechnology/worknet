import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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

  const handleChat = async () => {
    if (!provider) return;
    const number = provider.whatsappNumber || provider.phoneNumber;
    if (!number) {
      Alert.alert('Error', 'No contact number available');
      return;
    }
    const cleanNumber = number.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://wa.me/${cleanNumber}`);
      }
    } catch {
      Alert.alert('Error', 'Could not open WhatsApp');
    }
  };

  const handleCall = async () => {
    if (!provider?.phoneNumber) {
      Alert.alert('Error', 'No phone number available');
      return;
    }
    try {
      await Linking.openURL(`tel:${provider.phoneNumber}`);
    } catch {
      Alert.alert('Error', 'Could not open phone app');
    }
  };

  const fetchProvider = useCallback(async () => {
    if (!id) return;
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
  }, [id]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

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
                    borderColor: theme.background,
                    backgroundColor:
                      provider.availabilityStatus === 'online'
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
                {provider.primaryProfession}
              </ThemedText>
              {provider.isVerified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    { backgroundColor: theme.accent },
                  ]}>
                  <Feather
                    name='check-circle'
                    size={12}
                    color={theme.onAccent}
                  />
                  <ThemedText
                    style={[styles.verifiedText, { color: theme.onAccent }]}>
                    Verified
                  </ThemedText>
                </View>
              )}
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
                {provider.location?.homeCity || 'Near You'}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Home City
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <ThemedText style={styles.statValue}>
                {provider.languages?.[0] || 'English'}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Lang.
              </ThemedText>
            </View>
          </View>

          {/* Pricing & Availability */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Base Rate</ThemedText>
                <ThemedText style={[styles.infoValue, { color: theme.accent }]}>
                  Rs. {provider.pricing?.baseRate || 'Contact'}
                  {provider.pricing?.type === 'Hourly' ? '/hr' : ''}
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Availability</ThemedText>
                <ThemedText
                  style={[
                    styles.infoValue,
                    {
                      color:
                        provider.availabilityStatus === 'online'
                          ? '#4CAF50'
                          : theme.subtext,
                    },
                  ]}>
                  {provider.availabilityStatus === 'online'
                    ? 'Online Now'
                    : 'Away'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='subtitle'>
              About
            </ThemedText>
            <ThemedText style={[styles.sectionBody, { color: theme.text }]}>
              {provider.about || provider.bio || 'No description provided.'}
            </ThemedText>
          </View>

          {/* Professions/Skills */}
          {provider.secondaryProfessions &&
            provider.secondaryProfessions.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle} type='subtitle'>
                  Expertise
                </ThemedText>
                <View style={[styles.chipGrid, { marginTop: 8 }]}>
                  {provider.secondaryProfessions.map((skill, index) => (
                    <View
                      key={`skill-${index}`}
                      style={[
                        styles.areaChip,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          borderWidth: 1,
                        },
                      ]}>
                      <ThemedText
                        style={[styles.areaChipText, { color: theme.text }]}>
                        {skill}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Service Area */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='subtitle'>
              Service Coverage
            </ThemedText>
            <View style={styles.chipGrid}>
              <View
                style={[
                  styles.areaChip,
                  { backgroundColor: theme.accent + '15' },
                ]}>
                <Feather name='map-pin' size={12} color={theme.accent} />
                <ThemedText
                  style={[styles.areaChipText, { color: theme.accent }]}>
                  {provider.location?.homeCity}
                  {provider.location?.country
                    ? `, ${provider.location.country}`
                    : ''}{' '}
                  ({provider.serviceRadius || 25}km)
                </ThemedText>
              </View>
            </View>
          </View>
          {/* Work Samples */}
          {provider.workSamples && provider.workSamples.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type='subtitle'>
                Recent Work
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioScroll}>
                {provider.workSamples.map((url, index) => (
                  <Image
                    key={`work-sample-${index}-${url}`}
                    source={url}
                    style={styles.portfolioThumb}
                    contentFit='cover'
                    transition={200}
                  />
                ))}
              </ScrollView>
            </View>
          )}

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
                    key={`portfolio-${index}-${url}`}
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
            onPress={handleChat}
            style={[styles.chatBtn, { borderColor: theme.border }]}>
            <Feather name='message-circle' size={20} color={theme.text} />
            <ThemedText style={styles.chatBtnText} type='defaultSemiBold'>
              Chat
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCall}
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
  verifiedText: { fontSize: 10, fontWeight: '800' },
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
  infoCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  areaChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
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
  bookBtnText: { fontSize: 13, fontWeight: 'bold' },
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
