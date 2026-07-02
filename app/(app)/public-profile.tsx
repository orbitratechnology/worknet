import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { WorkSamplesCarousel } from '@/components/profile/work-samples-carousel';
import {
  ReportContentSheet,
  ReportContentSheetRef,
} from '@/components/report/report-content-sheet';
import { ReviewList } from '@/components/reviews/review-list';
import {
  WriteReviewSheet,
  WriteReviewSheetRef,
} from '@/components/reviews/write-review-sheet';
import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/ui/screen-shell';
import { StackHeader } from '@/components/ui/stack-header';
import { Layout } from '@/constants/theme';
import {
  WORKER_LANGUAGES,
  WORKER_LANGUAGE_META,
  type WorkerLanguage,
} from '@/constants/worker-languages';
import { WORKER_TYPES, type WorkerType } from '@/constants/worker-types';
import { useAuth } from '@/context/auth';
import { useAuthGate } from '@/context/auth-gate';
import { useProviderReviews } from '@/hooks/use-provider-reviews';
import { useSavedProviders } from '@/hooks/use-saved-providers';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useFieldStyle, useSurfaceStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from '@react-native-firebase/firestore';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
const WHATSAPP_GREEN = '#25D366';

const FALLBACK_WORKER_TYPE: Pick<WorkerType, 'icon' | 'color'> = {
  icon: 'briefcase',
  color: '#717171',
};

function resolveWorkerType(
  professionId?: string,
  professionName?: string,
): Pick<WorkerType, 'icon' | 'color'> {
  if (professionId) {
    const byId = WORKER_TYPES.find((w) => w.id === professionId);
    if (byId) return byId;
  }
  if (professionName) {
    const normalized = professionName.trim().toLowerCase();
    const byName = WORKER_TYPES.find(
      (w) => w.name.toLowerCase() === normalized,
    );
    if (byName) return byName;
  }
  return FALLBACK_WORKER_TYPE;
}

function StatColumn({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  const theme = useTheme();

  return (
    <View
      style={[styles.statCard, { backgroundColor: theme.muted }]}
      accessibilityLabel={`${label}: ${value}`}>
      <View style={[styles.statIconWrap, { backgroundColor: theme.creamDeep }]}>
        <Feather name={icon} size={20} color={theme.text} />
      </View>
      <ThemedText style={styles.statValue} selectable numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
}

function formatProfilePrice(pricing?: ServiceProvider['pricing']) {
  const rate = pricing?.baseRate;
  if (!rate) return { main: 'Contact for price', unit: null as string | null };
  const unit = pricing?.type === 'Hourly' ? '/hr' : null;
  return { main: `LKR ${rate.toLocaleString('en-LK')}`, unit };
}

function PriceSection({ pricing }: { pricing?: ServiceProvider['pricing'] }) {
  const theme = useTheme();
  const { main, unit } = formatProfilePrice(pricing);
  const isHourly = pricing?.type === 'Hourly';

  return (
    <View
      style={[styles.priceCard, { backgroundColor: '#25D366' }]}
      accessibilityLabel={`Price ${main}${unit ?? ''}`}>
      <View style={[styles.priceIconWrap]}>
        <MaterialCommunityIcons name='cash' size={32} color={theme.onSuccess} />
      </View>
      <View style={styles.priceContent}>
        <ThemedText
          style={[styles.priceEyebrow, { color: theme.onSuccess + 'CC' }]}>
          {isHourly ? 'Hourly rate' : 'Base rate'}
        </ThemedText>
        <View style={styles.priceAmountRow}>
          <ThemedText
            style={[styles.priceAmount, { color: theme.onSuccess }]}
            selectable>
            {main}
          </ThemedText>
          {unit ? (
            <ThemedText
              style={[styles.priceUnit, { color: theme.onSuccess }]}
              selectable>
              {unit}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function getSpokenWorkerLanguages(languages?: string[]) {
  const spoken = new Set(
    (languages ?? []).map((language) => language.trim().toLowerCase()),
  );
  return WORKER_LANGUAGES.filter((language) =>
    spoken.has(language.toLowerCase()),
  );
}

function LanguageBadges({ languages }: { languages?: string[] }) {
  const theme = useTheme();
  const activeLanguages = getSpokenWorkerLanguages(languages);

  if (activeLanguages.length === 0) return null;

  return (
    <View style={styles.languageRow}>
      {activeLanguages.map((language) => {
        const meta = WORKER_LANGUAGE_META[language as WorkerLanguage];
        return (
          <View
            key={language}
            style={[styles.languageBadge, { backgroundColor: theme.muted }]}
            accessibilityLabel={language}>
            <View
              style={[
                styles.languageGlyph,
                { backgroundColor: meta.accent + '18' },
              ]}>
              <ThemedText
                style={[styles.languageGlyphText, { color: meta.accent }]}>
                {meta.glyph}
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.languageName, { color: theme.text }]}
              selectable>
              {language}
            </ThemedText>
          </View>
        );
      })}
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
  const surfaceStyle = useSurfaceStyle();
  const fieldStyle = useFieldStyle();
  const { bottom } = useScreenInsets();

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { reviews, refresh: refreshReviews } = useProviderReviews(providerId);

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
      setError(
        'Could not load this profile. Check your connection and try again.',
      );
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
            style={[
              styles.retryBtn,
              { borderColor: theme.border },
              fieldStyle,
            ]}>
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
  const workerType = resolveWorkerType(
    provider.primaryProfessionId,
    provider.primaryProfession,
  );
  const saved = isSaved(provider.id);

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
              accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark worker'}
              onPress={() =>
                gateAction('Sign in to save workers', () =>
                  toggleSave(provider.id),
                )
              }>
              {saved ? (
                <Ionicons name='bookmark' size={24} color={theme.text} />
              ) : (
                <Ionicons
                  name='bookmark-outline'
                  size={24}
                  color={theme.text}
                />
              )}
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
            onRatingPress={() =>
              router.push({
                pathname: '/(app)/provider-reviews',
                params: {
                  id: provider.id,
                  name: provider.name,
                  rating: String(provider.rating ?? 0),
                },
              })
            }
          />

          <View style={styles.titleBlock}>
            <ThemedText style={styles.providerName} type='title' selectable>
              {provider.name}
            </ThemedText>
            <View style={styles.roleRow}>
              <MaterialCommunityIcons
                name={workerType.icon as never}
                size={16}
                color={workerType.color}
              />
              <ThemedText
                style={[styles.providerRole, { color: theme.subtext }]}
                selectable>
                {provider.primaryProfession}
              </ThemedText>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatColumn
              label='Experience'
              value={`${provider.experienceYears || '0-1'} yrs`}
              icon='award'
            />
            <StatColumn
              label='Location'
              value={provider.location?.homeCity || 'Nearby'}
              icon='map-pin'
            />
          </View>

          {getSpokenWorkerLanguages(provider.languages).length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Feather name='globe' size={18} color={theme.text} />
                <ThemedText
                  style={styles.sectionTitle}
                  type='headline'
                  selectable>
                  Languages
                </ThemedText>
              </View>
              <LanguageBadges languages={provider.languages} />
            </View>
          ) : null}

          <PriceSection pricing={provider.pricing} />

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Feather name='user' size={18} color={theme.text} />
              <ThemedText
                style={styles.sectionTitle}
                type='headline'
                selectable>
                About
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionBody} selectable>
              {provider.about || provider.bio || 'No description provided.'}
            </ThemedText>
          </View>

          {provider.secondaryProfessions &&
          provider.secondaryProfessions.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Feather name='layers' size={18} color={theme.text} />
                <ThemedText
                  style={styles.sectionTitle}
                  type='headline'
                  selectable>
                  Expertise
                </ThemedText>
              </View>
              <View style={styles.chipGrid}>
                {provider.secondaryProfessions.map((skill, index) => (
                  <View
                    key={`skill-${index}`}
                    style={[styles.chip, { backgroundColor: theme.muted }]}>
                    <Feather
                      name='check-circle'
                      size={12}
                      color={theme.success}
                    />
                    <ThemedText style={styles.chipText} selectable>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Feather name='tool' size={18} color={theme.text} />
              <ThemedText
                style={styles.sectionTitle}
                type='headline'
                selectable>
                Services offered
              </ThemedText>
            </View>
            {provider.services && provider.services.length > 0 ? (
              provider.services.map((service) => (
                <View
                  key={service.id}
                  style={[
                    styles.serviceItem,
                    {
                      backgroundColor: theme.card,
                    },
                    surfaceStyle,
                  ]}>
                  <View style={styles.serviceItemHeader}>
                    <MaterialCommunityIcons
                      name='hammer-wrench'
                      size={16}
                      color={workerType.color}
                    />
                    <ThemedText style={styles.serviceItemTitle} selectable>
                      {service.title}
                    </ThemedText>
                  </View>
                  <View style={styles.servicePriceRow}>
                    <MaterialCommunityIcons
                      name='cash'
                      size={14}
                      color={theme.success}
                    />
                    <ThemedText style={styles.serviceItemPrice} selectable>
                      Rs. {service.minPrice} – Rs. {service.maxPrice}
                    </ThemedText>
                  </View>
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

          {provider.workSamples && provider.workSamples.length > 0 ? (
            <WorkSamplesCarousel samples={provider.workSamples} />
          ) : null}

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <ThemedText
                style={styles.sectionTitle}
                type='headline'
                selectable>
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
                  <Pressable
                    onPress={() => reviewSheetRef.current?.open()}
                    style={({ pressed }) => [
                      styles.writeReviewBtn,
                      {
                        backgroundColor: theme.accent,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                    accessibilityRole='button'
                    accessibilityLabel='Write review'>
                    <Feather name='edit-3' size={16} color={theme.onAccent} />
                    <ThemedText
                      style={[
                        styles.writeReviewBtnText,
                        { color: theme.onAccent },
                      ]}>
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
            borderTopColor: theme.divider,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}>
        <Pressable
          onPress={handleWhatsApp}
          style={({ pressed }) => [
            styles.contactBtn,
            {
              backgroundColor: WHATSAPP_GREEN,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <MaterialCommunityIcons name='whatsapp' size={22} color='#FFFFFF' />
          <ThemedText
            style={[styles.contactBtnText, { color: '#FFFFFF' }]}
            type='defaultSemiBold'>
            WhatsApp
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.contactBtn,
            styles.callBtn,
            {
              backgroundColor: theme.success,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Feather name='phone-call' size={20} color={theme.onSuccess} />
          <ThemedText
            style={[styles.contactBtnText, { color: theme.onSuccess }]}
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
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    gap: 6,
  },
  languageGlyph: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageGlyphText: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    minWidth: 0,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  priceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  priceContent: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  priceEyebrow: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  priceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 2,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  priceUnit: {
    fontSize: 18,
    fontWeight: '500',
  },
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    minHeight: 40,
  },
  writeReviewBtnText: {
    fontSize: 14,
    fontWeight: '700',
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
    gap: 6,
  },
  serviceItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servicePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  contactBtn: {
    flex: 1,
    minHeight: Layout.inputHeight,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    flex: 1.4,
  },
  contactBtnText: {
    fontSize: 15,
  },
});
