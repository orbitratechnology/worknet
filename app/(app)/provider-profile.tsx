import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { db } from '@/lib/firebase';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const { contentBottom } = useScreenInsets();

  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'service_providers', user.uid),
      (doc) => {
        if (doc.exists()) {
          setProviderData(doc.data());
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size='large' color={theme.accent} />
        </View>
      </ScreenShell>
    );
  }

  if (!providerData) {
    return (
      <ScreenShell>
        <View
          style={[
            styles.center,
            { backgroundColor: theme.secondaryBackground },
          ]}>
        <Feather name='alert-circle' size={48} color={theme.subtext} />
        <ThemedText style={styles.emptyTitle}>No Identity Found</ThemedText>
        <TouchableOpacity
          style={styles.enrollBtn}
          onPress={() => router.push('/(app)/enroll-provider')}>
          <LinearGradient
            colors={[theme.accent, '#1E40AF']}
            style={styles.gradient}>
            <ThemedText style={[styles.enrollText, { color: theme.onAccent }]}>
              Set up Professional Profile
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <StackHeader
        title='Professional Identity'
        border
        right={
          <TouchableOpacity
            onPress={() => router.push('/(app)/enroll-provider')}
            style={[
              styles.editButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <Feather name='edit-3' size={18} color={theme.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottom + 24 },
        ]}>
          {/* Hero Section */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <Image
              source={
                providerData.imageUrl ||
                'https://ui-avatars.com/api/?name=' + providerData.name
              }
              style={styles.profileImage}
            />
            <View style={styles.heroInfo}>
              <ThemedText style={styles.name}>{providerData.name}</ThemedText>
              <ThemedText style={[styles.role, { color: theme.subtext }]}>
                {providerData.primaryProfession}
              </ThemedText>
              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: theme.accent + '10' },
                ]}>
                <MaterialIcons name='verified' size={14} color={theme.accent} />
                <ThemedText
                  style={[styles.verifiedText, { color: theme.accent }]}>
                  Verified Professional
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <View style={styles.statHeader}>
                <Feather name='star' size={14} color='#EAB308' />
                <ThemedText style={styles.statVal}>
                  {providerData.rating || '5.0'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.statLab, { color: theme.subtext }]}>
                Rating
              </ThemedText>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <View style={styles.statHeader}>
                <Feather name='clock' size={14} color={theme.accent} />
                <ThemedText style={styles.statVal}>
                  {providerData.experienceYears || '0'}+
                </ThemedText>
              </View>
              <ThemedText style={[styles.statLab, { color: theme.subtext }]}>
                Years Exp
              </ThemedText>
            </View>
          </View>

          {/* Contact Details */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.sectionHeader}>
              <Feather name='map-pin' size={18} color={theme.accent} />
              <ThemedText style={styles.sectionTitle}>
                Contact & Location
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.secondaryBackground },
                ]}>
                <Feather name='phone' size={16} color={theme.accent} />
              </View>
              <View>
                <ThemedText style={styles.detailValue}>
                  {providerData.phoneNumber}
                </ThemedText>
                <ThemedText
                  style={[styles.detailLabel, { color: theme.subtext }]}>
                  Primary Phone
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.secondaryBackground },
                ]}>
                <Feather name='map-pin' size={16} color={theme.accent} />
              </View>
              <View>
                <ThemedText style={styles.detailValue}>
                  {providerData.location?.homeCity}
                  {providerData.location?.country
                    ? `, ${providerData.location.country}`
                    : ''}
                </ThemedText>
                <ThemedText
                  style={[styles.detailLabel, { color: theme.subtext }]}>
                  Service Hub ({providerData.serviceRadius || 25}km radius)
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Expertise & Skills */}
          {providerData.secondaryProfessions &&
            providerData.secondaryProfessions.length > 0 && (
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <View style={styles.sectionHeader}>
                  <Feather name='award' size={18} color={theme.accent} />
                  <ThemedText style={styles.sectionTitle}>Expertise</ThemedText>
                </View>
                <View style={styles.chipGrid}>
                  {providerData.secondaryProfessions.map(
                    (skill: string, index: number) => (
                      <View
                        key={`skill-${index}`}
                        style={[
                          styles.areaChip,
                          {
                            backgroundColor: theme.secondaryBackground,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                        ]}>
                        <ThemedText
                          style={[styles.areaChipText, { color: theme.text }]}>
                          {skill}
                        </ThemedText>
                      </View>
                    ),
                  )}
                </View>
              </View>
            )}

          {/* Services Offered */}
          {providerData.services && providerData.services.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <View style={styles.sectionHeader}>
                <Feather name='briefcase' size={18} color={theme.accent} />
                <ThemedText style={styles.sectionTitle}>
                  Services Offered
                </ThemedText>
              </View>
              {providerData.services.map((service: any) => (
                <View
                  key={service.id}
                  style={[
                    styles.serviceItem,
                    {
                      backgroundColor: theme.secondaryBackground,
                      borderColor: theme.border,
                    },
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
                  </View>
                  <ThemedText
                    style={[styles.serviceItemDesc, { color: theme.subtext }]}
                    numberOfLines={2}>
                    {service.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Portfolio / Work Samples */}
          {providerData.portfolioUrls &&
            providerData.portfolioUrls.length > 0 && (
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <View style={styles.sectionHeader}>
                  <Feather name='image' size={18} color={theme.accent} />
                  <ThemedText style={styles.sectionTitle}>
                    Recent Work
                  </ThemedText>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.portfolioScroll}>
                  {providerData.portfolioUrls.map(
                    (url: string, index: number) => (
                      <Image
                        key={`portfolio-${index}-${url}`}
                        source={url}
                        style={styles.portfolioThumb}
                      />
                    ),
                  )}
                </ScrollView>
              </View>
            )}

          {/* Pricing & Terms */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.sectionHeader}>
              <Feather name='credit-card' size={18} color={theme.accent} />
              <ThemedText style={styles.sectionTitle}>
                Pricing & Terms
              </ThemedText>
            </View>

            <View style={styles.pricingGrid}>
              <View style={styles.priceBox}>
                <ThemedText style={styles.priceVal}>
                  LKR {providerData.pricing?.baseRate || '1,500'}
                </ThemedText>
                <ThemedText
                  style={[styles.detailLabel, { color: theme.subtext }]}>
                  Base {providerData.pricing?.type || 'Hourly'}
                </ThemedText>
              </View>
              <View style={styles.vDivider} />
              <View style={styles.priceBox}>
                <ThemedText style={styles.priceVal}>
                  {providerData.pricing?.negotiable ? 'Flexible' : 'Fixed'}
                </ThemedText>
                <ThemedText
                  style={[styles.detailLabel, { color: theme.subtext }]}>
                  Rate Type
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  editButton: {
    width: Layout.minTouch,
    height: Layout.minTouch,
    borderRadius: Layout.chipRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.itemGap + 4,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    gap: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  heroInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLab: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
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
  portfolioScroll: { gap: 12 },
  portfolioThumb: { width: 120, height: 120, borderRadius: 12 },
  pricingGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  priceBox: {
    alignItems: 'center',
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  vDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 24,
  },
  enrollBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enrollText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
