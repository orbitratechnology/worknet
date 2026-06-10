import { ThemedText } from '@/components/themed-text';
import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { WorkSamplesCarousel } from '@/components/profile/work-samples-carousel';
import { ReportContentSheet, ReportContentSheetRef } from '@/components/report/report-content-sheet';
import { ReviewList } from '@/components/reviews/review-list';
import {
  WriteReviewSheet,
  WriteReviewSheetRef,
} from '@/components/reviews/write-review-sheet';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { cardShadow, Layout } from '@/constants/theme';
import { formatLanguagesLabel } from '@/constants/worker-languages';
import { db } from '@/lib/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { useAuthGate } from '@/context/auth-gate';
import { useAuth } from '@/context/auth';
import { useSavedProviders } from '@/hooks/use-saved-providers';
import { useProviderReviews } from '@/hooks/use-provider-reviews';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from '@react-native-firebase/firestore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const REVIEW_PREVIEW_COUNT = 2;

function StatColumn({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.card,
          boxShadow: cardShadow(colorScheme),
        },
      ]}>
      <ThemedText style={styles.statValue} selectable numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText
        style={[styles.statLabel, { color: theme.subtext }]}
        selectable>
        {label}
      </ThemedText>
    </View>
  );
}

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const providerId = typeof id === 'string' ? id : undefined;
  const { user } = useAuth();
  const { gateAction } = useAuthGate();
  const { isSaved, toggleSave } = useSavedProviders();
  const reviewSheetRef = useRef<WriteReviewSheetRef>(null);
  const reportSheetRef = useRef<ReportContentSheetRef>(null);
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const { bottom } = useScreenInsets();

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    reviews,
    refresh: refreshReviews,
  } = useProviderReviews(providerId);

  const hasUserReview = !!user && reviews.some((r) => r.userId === user.uid);
  const previewReviews = useMemo(
    () => reviews.slice(0, REVIEW_PREVIEW_COUNT),
    [reviews],
  );

  const handleWhatsApp = async () => {
    if (!provider) return;
    const number = provider.whatsappNumber || provider.phoneNumber;
    if (!number) {
      Alert.alert(
        'No WhatsApp number',
        'This provider has not added a WhatsApp number yet. Try calling instead.',
      );
      return;
    }
    const cleanNumber = number.replace(/\D/g, '');
    const city = provider.location?.homeCity ?? 'my area';
    const profession = provider.primaryProfession ?? 'help';
    const text = encodeURIComponent(
      `Hi ${provider.name}, I found you on Worknet. I need help with ${profession} in ${city}. Are you available?`,
    );
    const url = `whatsapp://send?phone=${cleanNumber}&text=${text}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://wa.me/${cleanNumber}`);
      }
    } catch {
      Alert.alert(
        'Could not open WhatsApp',
        'Check that WhatsApp is installed, or try calling instead.',
      );
    }
  };

  const handleCall = async () => {
    if (!provider?.phoneNumber) {
      Alert.alert(
        'No phone number',
        'This provider has not added a phone number yet.',
      );
      return;
    }
    try {
      await Linking.openURL(`tel:${provider.phoneNumber}`);
    } catch {
      Alert.alert(
        'Could not start call',
        'Your device could not open the phone app. Try WhatsApp instead.',
      );
    }
  };

  const fetchProvider = useCallback(async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const docSnap = await getDoc(doc(db, 'service_providers', providerId));
      if (docSnap.exists()) {
        setProvider({ id: docSnap.id, ...docSnap.data() } as ServiceProvider);
      } else {
        setProvider(null);
        setError('This provider profile is no longer available.');
      }
    } catch (fetchError) {
      console.error('Error fetching provider:', fetchError);
      setError('Could not load this profile. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  const refreshProfile = useCallback(async () => {
    await Promise.all([fetchProvider(), refreshReviews()]);
  }, [fetchProvider, refreshReviews]);

  useEffect(() => {
    if (providerId) {
      fetchProvider();
    }
  }, [fetchProvider, providerId]);

  if (!providerId) {
    return <Redirect href='/(tabs)/profile' />;
  }

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size='large' color={theme.text} />
        </View>
      </ScreenShell>
    );
  }

  if (!provider) {
    return (
      <ScreenShell>
        <StackHeader title='Profile' />
        <View style={styles.center}>
          <ThemedText style={{ marginBottom: 8 }} selectable>
            {error || 'Provider not found'}
          </ThemedText>
          <Pressable
            onPress={() => {
              setLoading(true);
              fetchProvider();
            }}
            style={[styles.retryBtn, { borderColor: theme.border }]}>
            <ThemedText selectable>Try again</ThemedText>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
            <ThemedText style={{ color: theme.subtext }} selectable>
              Go back
            </ThemedText>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  const avatarImage =
    provider.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      provider.name,
    )}&background=222222&color=FAF7F2&size=512&bold=true`;
  const isOnline = provider.availabilityStatus === 'online';
  const reviewCount = provider.reviewCount ?? reviews.length;

  return (
    <ScreenShell>
      <StackHeader
        title={provider.title || provider.name || 'Worker'}
        right={
          <View style={styles.headerActions}>
            <Pressable
              hitSlop={8}
              accessibilityRole='button'
              accessibilityLabel='Report profile'
              onPress={() =>
                gateAction('Sign in to report content', () =>
                  reportSheetRef.current?.open({
                    targetType: 'provider',
                    targetId: provider.id,
                    providerId: provider.id,
                    title: 'Report profile',
                  }),
                )
              }>
              <Feather name='flag' size={20} color={theme.text} />
            </Pressable>
            <Pressable
              hitSlop={8}
              accessibilityRole='button'
              accessibilityLabel={
                isSaved(provider.id) ? 'Remove from saved' : 'Save worker'
              }
              onPress={() =>
                gateAction('Sign in to save workers', () => toggleSave(provider.id))
              }>
              <Feather
                name='heart'
                size={20}
                color={isSaved(provider.id) ? '#FF6B6B' : theme.text}
              />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <ProfileAvatar
            name={provider.name}
            imageUrl={avatarImage}
            rating={provider.rating}
            reviewCount={reviewCount}
            isOnline={isOnline}
          />

          <View style={styles.titleBlock}>
            <ThemedText style={styles.providerName} type='title' selectable>
              {provider.name}
            </ThemedText>
            <ThemedText
              style={[styles.providerRole, { color: theme.subtext }]}
              selectable>
              {provider.primaryProfession}
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <StatColumn
              label='Experience'
              value={`${provider.experienceYears || '0-1'} yrs`}
            />
            <StatColumn
              label='Location'
              value={provider.location?.homeCity || 'Nearby'}
            />
            <StatColumn
              label='Language'
              value={formatLanguagesLabel(provider.languages)}
            />
          </View>

          <View
            style={[
              styles.priceCard,
              {
                backgroundColor: theme.card,
                boxShadow: cardShadow(colorScheme),
              },
            ]}>
            <View style={styles.priceCol}>
              <ThemedText style={[styles.priceLabel, { color: theme.subtext }]}>
                Base rate
              </ThemedText>
              <ThemedText style={styles.priceValue} selectable>
                Rs. {provider.pricing?.baseRate || 'Contact'}
                {provider.pricing?.type === 'Hourly' ? '/hr' : ''}
              </ThemedText>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: theme.border }]} />
            <View style={styles.priceCol}>
              <ThemedText style={[styles.priceLabel, { color: theme.subtext }]}>
                Availability
              </ThemedText>
              <ThemedText
                style={[
                  styles.priceValue,
                  { color: isOnline ? theme.online : theme.offline },
                ]}
                selectable>
                {isOnline ? 'Available now' : 'Currently away'}
              </ThemedText>
            </View>
          </View>

          {provider.workSamples && provider.workSamples.length > 0 ? (
            <WorkSamplesCarousel samples={provider.workSamples} />
          ) : null}

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='headline' selectable>
              About
            </ThemedText>
            <ThemedText style={styles.sectionBody} selectable>
              {provider.about || provider.bio || 'No description provided.'}
            </ThemedText>
          </View>

          {provider.secondaryProfessions &&
          provider.secondaryProfessions.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type='headline' selectable>
                Expertise
              </ThemedText>
              <View style={styles.chipGrid}>
                {provider.secondaryProfessions.map((skill, index) => (
                  <View
                    key={`skill-${index}`}
                    style={[styles.chip, { backgroundColor: theme.muted }]}>
                    <ThemedText style={styles.chipText} selectable>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='headline' selectable>
              Location
            </ThemedText>
            <View style={[styles.chip, { backgroundColor: theme.muted }]}>
              <Feather name='map-pin' size={12} color={theme.text} />
              <ThemedText style={styles.chipText} selectable>
                {provider.location?.homeCity}
                {provider.location?.country
                  ? `, ${provider.location.country}`
                  : ''}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type='headline' selectable>
              Services offered
            </ThemedText>
            {provider.services && provider.services.length > 0 ? (
              provider.services.map((service) => (
                <View
                  key={service.id}
                  style={[
                    styles.serviceItem,
                    {
                      backgroundColor: theme.card,
                      boxShadow: cardShadow(colorScheme),
                    },
                  ]}>
                  <ThemedText style={styles.serviceItemTitle} selectable>
                    {service.title}
                  </ThemedText>
                  <ThemedText style={styles.serviceItemPrice} selectable>
                    Rs. {service.minPrice} – Rs. {service.maxPrice}
                  </ThemedText>
                  <ThemedText
                    style={[styles.serviceItemDesc, { color: theme.subtext }]}
                    numberOfLines={3}
                    selectable>
                    {service.description}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={{ color: theme.subtext }} selectable>
                General services available based on profession.
              </ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <ThemedText style={styles.sectionTitle} type='headline' selectable>
                Reviews
              </ThemedText>
              <View style={styles.reviewActions}>
                {reviewCount > 0 ? (
                  <Pressable
                    accessibilityRole='button'
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/provider-reviews',
                        params: {
                          id: provider.id,
                          name: provider.name,
                          rating: String(provider.rating),
                        },
                      })
                    }>
                    <ThemedText
                      style={{ color: theme.accent, fontWeight: '600' }}>
                      See all
                    </ThemedText>
                  </Pressable>
                ) : null}
                {!user ? (
                  <Pressable
                    onPress={() =>
                      gateAction('Sign in to leave a review', () => {})
                    }>
                    <ThemedText
                      style={{ color: theme.accent, fontWeight: '600' }}>
                      Sign in
                    </ThemedText>
                  </Pressable>
                ) : !hasUserReview ? (
                  <Pressable onPress={() => reviewSheetRef.current?.open()}>
                    <ThemedText
                      style={{ color: theme.accent, fontWeight: '600' }}>
                      Write review
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <ReviewList
              reviews={previewReviews}
              onReportReview={(review) =>
                gateAction('Sign in to report content', () =>
                  reportSheetRef.current?.open({
                    targetType: 'review',
                    targetId: review.id,
                    providerId: provider.id,
                    title: 'Report review',
                  }),
                )
              }
            />
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <WriteReviewSheet
        ref={reviewSheetRef}
        providerId={provider.id}
        providerName={provider.name}
        onSubmitted={refreshProfile}
      />

      <ReportContentSheet ref={reportSheetRef} />

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}>
        <Pressable
          onPress={handleWhatsApp}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: theme.border,
              backgroundColor: theme.card,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Feather name='message-circle' size={20} color={theme.text} />
          <ThemedText style={styles.secondaryBtnText} type='defaultSemiBold'>
            WhatsApp
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: theme.text,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <Feather name='phone-call' size={20} color={theme.onAccent} />
          <ThemedText
            style={[styles.primaryBtnText, { color: theme.onAccent }]}
            type='defaultSemiBold'>
            Call now
          </ThemedText>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.screenPadding,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    gap: Layout.sectionGap,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 4,
    marginTop: -4,
  },
  providerName: {
    fontSize: 26,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  providerRole: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    padding: 18,
  },
  priceCol: {
    flex: 1,
    gap: 4,
  },
  priceDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 16,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  section: {
    gap: 12,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sectionTitle: {
    letterSpacing: -0.3,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Layout.chipRadius,
    gap: 6,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceItem: {
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    padding: 16,
    marginBottom: 10,
    gap: 4,
  },
  serviceItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  serviceItemDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: Layout.inputHeight,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
  },
  primaryBtn: {
    flex: 1.4,
    minHeight: Layout.inputHeight,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
  },
});
