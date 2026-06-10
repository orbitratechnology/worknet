import { ThemedText } from '@/components/themed-text';
import { ActionRow } from '@/components/ui/action-row';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { cardShadow, Layout, Typography } from '@/constants/theme';
import { profileCompleteness } from '@/hooks/use-worker-onboarding';
import { useAuth } from '@/context/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { formatRatingDisplay, formatReviewCount } from '@/lib/ratings';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { doc, onSnapshot, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

const ONBOARD_BENEFITS = [
  {
    icon: 'search' as const,
    title: 'Get discovered locally',
    body: 'Appear in search when customers need your skills nearby.',
  },
  {
    icon: 'phone' as const,
    title: 'Direct contact',
    body: 'Customers reach you by phone or WhatsApp — no middleman.',
  },
  {
    icon: 'shield' as const,
    title: 'You stay in control',
    body: 'Toggle availability anytime. Your NIC stays private.',
  },
];

const ONBOARD_STEPS = [
  { label: 'Name & photo', icon: 'user' as const },
  { label: 'NIC & phone verify', icon: 'shield' as const },
  { label: 'Choose profession', icon: 'briefcase' as const },
  { label: 'Set your location', icon: 'map-pin' as const },
  { label: 'Publish profile', icon: 'check-circle' as const },
];

function StatBox({
  label,
  value,
  accent,
  onPress,
}: {
  label: string;
  value: string;
  accent?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';

  const content = (
    <>
      <ThemedText
        style={[
          styles.statValue,
          accent ? { color: theme.success } : undefined,
        ]}
        type='defaultSemiBold'>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
        {label}
      </ThemedText>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.statBox,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            boxShadow: cardShadow(colorScheme),
          },
        ]}>
        {content}
      </View>
    );
  }

  return (
    <HapticPressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statBox,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: cardShadow(colorScheme),
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      {content}
    </HapticPressable>
  );
}

function WorkerDashboard({
  data,
  userId,
}: {
  data: ServiceProvider;
  userId: string;
}) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [online, setOnline] = useState(data.availabilityStatus === 'online');

  useEffect(() => {
    setOnline(data.availabilityStatus === 'online');
  }, [data.availabilityStatus]);

  const completeness = profileCompleteness({
    name: data.name,
    imageUri: data.imageUrl ?? null,
    nicNumber: data.nicNumber ?? '',
    phoneVerified: !!data.phoneVerified,
    phoneNumber: data.phoneNumber,
    primaryProfessionId: data.primaryProfessionId,
    primaryProfession: data.primaryProfession,
    latitude: data.location?.latitude ?? null,
    longitude: data.location?.longitude ?? null,
    homeCity: data.location?.homeCity ?? '',
    country: data.location?.country ?? '',
    whatsappNumber: data.whatsappNumber ?? '',
    bio: data.bio ?? '',
    experienceYears: data.experienceYears ?? '0-1',
    baseRate: data.pricing?.baseRate?.toString() ?? '',
    pricingType: 'Hourly',
    workSampleUris: [],
    socialLinks: data.socialLinks ?? {},
    emergencyAvailability: data.emergencyAvailability,
    languages: data.languages ?? [],
  });

  const reviewCount = data.reviewCount ?? 0;
  const ratingValue = data.rating ?? 0;

  const openReviews = () => {
    router.push({
      pathname: '/(app)/provider-reviews',
      params: {
        id: userId,
        name: data.name,
        rating: String(ratingValue),
      },
    });
  };

  const toggleAvailability = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const status = val ? 'online' : 'offline';
    setOnline(val);
    await setDoc(
      doc(db, 'service_providers', userId),
      { availabilityStatus: status, updatedAt: serverTimestamp() },
      { merge: true },
    );
  };

  const quickActions = useMemo(
    () => [
      {
        icon: 'edit-3' as const,
        title: 'Edit profile',
        subtitle: 'Name, photo, and identity',
        href: '/(app)/become-worker/identity',
      },
      {
        icon: 'image' as const,
        title: 'Work photos',
        subtitle: 'Showcase your best projects',
        href: '/(app)/become-worker/details',
      },
      {
        icon: 'dollar-sign' as const,
        title: 'Pricing & bio',
        subtitle: 'Rate, experience, and about you',
        href: '/(app)/become-worker/details',
      },
      {
        icon: 'map-pin' as const,
        title: 'Location',
        subtitle: data.location?.homeCity ?? 'Update your service area',
        href: '/(app)/become-worker/location',
      },
    ],
    [data.location?.homeCity],
  );

  return (
    <>
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: online ? theme.success + '12' : theme.card,
            borderColor: online ? theme.success + '35' : theme.border,
            boxShadow: cardShadow(colorScheme),
          },
        ]}>
        <View
          style={[
            styles.statusIcon,
            {
              backgroundColor: online ? theme.success + '20' : theme.muted,
            },
          ]}>
          <Feather
            name={online ? 'eye' : 'eye-off'}
            size={20}
            color={online ? theme.success : theme.subtext}
          />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={styles.statusTitle} type='defaultSemiBold'>
            {online ? 'Visible in search' : 'Hidden from search'}
          </ThemedText>
          <ThemedText style={[styles.statusSub, { color: theme.subtext }]}>
            {online
              ? 'Customers nearby can find and contact you'
              : 'Go online when you are ready to take jobs'}
          </ThemedText>
        </View>
        <Switch
          value={online}
          onValueChange={toggleAvailability}
          trackColor={{ false: theme.border, true: theme.online }}
          thumbColor={theme.onAccent}
        />
      </View>

      <View style={styles.statsRow}>
        <StatBox
          label='Rating'
          value={formatRatingDisplay(ratingValue, reviewCount)}
          onPress={openReviews}
        />
        <StatBox
          label='Reviews'
          value={formatReviewCount(reviewCount)}
          onPress={openReviews}
        />
        <StatBox
          label='Complete'
          value={`${completeness}%`}
          accent={completeness >= 80}
        />
      </View>

      {completeness < 100 ? (
        <View
          style={[
            styles.completenessBanner,
            { backgroundColor: theme.muted, borderColor: theme.border },
          ]}>
          <Feather name='trending-up' size={18} color={theme.text} />
          <ThemedText style={[styles.completenessText, { color: theme.subtext }]}>
            Complete your profile to rank higher in search results.
          </ThemedText>
          <HapticPressable
            onPress={() => router.push('/(app)/become-worker/details')}
            style={({ pressed }) => [
              styles.completenessCta,
              { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 },
            ]}>
            <ThemedText
              style={[styles.completenessCtaText, { color: theme.onAccent }]}>
              Improve
            </ThemedText>
          </HapticPressable>
        </View>
      ) : null}

      <View
        style={[
          styles.actionsCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            boxShadow: cardShadow(colorScheme),
          },
        ]}>
        <SectionHeader title='Manage profile' />
        {quickActions.map((action, i) => (
          <View key={action.title}>
            <ActionRow
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              onPress={() => router.push(action.href as never)}
            />
            {i < quickActions.length - 1 ? (
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {(data.socialLinks?.instagram || data.socialLinks?.facebook) ? (
        <View
          style={[
            styles.actionsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              boxShadow: cardShadow(colorScheme),
            },
          ]}>
          <SectionHeader title='Social links' />
          {data.socialLinks.instagram ? (
            <ActionRow
              icon='instagram'
              title='Instagram'
              subtitle={data.socialLinks.instagram}
              onPress={() => {
                const handle = data.socialLinks!.instagram!;
                const url = handle.startsWith('http')
                  ? handle
                  : `https://instagram.com/${handle.replace('@', '')}`;
                void Linking.openURL(url);
              }}
            />
          ) : null}
          {data.socialLinks.facebook ? (
            <>
              {data.socialLinks.instagram ? (
                <View
                  style={[styles.divider, { backgroundColor: theme.border }]}
                />
              ) : null}
              <ActionRow
                icon='facebook'
                title='Facebook'
                subtitle={data.socialLinks.facebook}
                onPress={() => {
                  const url = data.socialLinks!.facebook!.startsWith('http')
                    ? data.socialLinks!.facebook!
                    : `https://${data.socialLinks!.facebook!}`;
                  void Linking.openURL(url);
                }}
              />
            </>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

export default function OfferServiceScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { requireAuth } = useRequireAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const { contentBottom } = useScreenInsets({ tabBar: true });
  const isWorker = !!userProfile?.isServiceProvider;
  const [workerData, setWorkerData] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    if (!user?.uid || !isWorker) return;
    return onSnapshot(doc(db, 'service_providers', user.uid), (snap) => {
      if (snap.exists()) {
        setWorkerData({ ...(snap.data() as ServiceProvider), id: snap.id });
      }
    });
  }, [user?.uid, isWorker]);

  const startOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!requireAuth('Sign in to become a Worker')) return;
    router.push('/become-worker');
  };

  if (isWorker && workerData) {
    return (
      <ScreenShell>
        <ScrollView
          contentInsetAdjustmentBehavior='automatic'
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottom },
          ]}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader title='Worker Dashboard' subtitle='Manage your profile' />

          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                boxShadow: cardShadow(colorScheme),
              },
            ]}>
            <Image
              source={
                workerData.imageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(workerData.name)}`
              }
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName} type='defaultSemiBold'>
                {workerData.name}
              </ThemedText>
              <ThemedText style={{ color: theme.subtext }}>
                {workerData.primaryProfession}
              </ThemedText>
              {workerData.location?.homeCity ? (
                <View style={styles.locationRow}>
                  <Feather name='map-pin' size={12} color={theme.subtext} />
                  <ThemedText
                    style={[styles.locationText, { color: theme.subtext }]}>
                    {workerData.location.homeCity}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <View
              style={[
                styles.onlinePill,
                {
                  backgroundColor:
                    workerData.availabilityStatus === 'online'
                      ? theme.success + '18'
                      : theme.muted,
                },
              ]}>
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor:
                      workerData.availabilityStatus === 'online'
                        ? theme.online
                        : theme.offline,
                  },
                ]}
              />
              <ThemedText
                style={[
                  styles.onlinePillText,
                  {
                    color:
                      workerData.availabilityStatus === 'online'
                        ? theme.success
                        : theme.subtext,
                  },
                ]}>
                {workerData.availabilityStatus === 'online'
                  ? 'Online'
                  : 'Offline'}
              </ThemedText>
            </View>
          </View>

          <WorkerDashboard data={workerData} userId={user!.uid} />
        </ScrollView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title='Become a Worker'
          subtitle='List your skills and get discovered locally.'
        />

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.text,
              boxShadow: cardShadow(colorScheme),
            },
          ]}>
          <View style={styles.heroIconRow}>
            <MaterialCommunityIcons
              name='hard-hat'
              size={28}
              color={theme.onAccent}
            />
            <View
              style={[
                styles.heroBadge,
                { backgroundColor: 'rgba(255,255,255,0.15)' },
              ]}>
              <ThemedText style={styles.heroBadgeText}>~5 min setup</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.heroTitle, { color: theme.onAccent }]}>
            Turn your skills into local work
          </ThemedText>
          <ThemedText style={styles.heroBody}>
            Join workers across Sri Lanka. Customers find you and contact you
            directly — no approval wait.
          </ThemedText>
        </View>

        <SectionHeader title='Why join Worknet' />
        <View style={styles.benefitsGrid}>
          {ONBOARD_BENEFITS.map((b) => (
            <View
              key={b.title}
              style={[
                styles.benefitCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  boxShadow: cardShadow(colorScheme),
                },
              ]}>
              <View
                style={[styles.benefitIcon, { backgroundColor: theme.muted }]}>
                <Feather name={b.icon} size={18} color={theme.text} />
              </View>
              <ThemedText style={styles.benefitTitle} type='defaultSemiBold'>
                {b.title}
              </ThemedText>
              <ThemedText style={[styles.benefitBody, { color: theme.subtext }]}>
                {b.body}
              </ThemedText>
            </View>
          ))}
        </View>

        <SectionHeader title='How it works' />
        <View
          style={[
            styles.stepsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              boxShadow: cardShadow(colorScheme),
            },
          ]}>
          {ONBOARD_STEPS.map((step, i) => (
            <View key={step.label}>
              <View style={styles.stepRow}>
                <View
                  style={[styles.stepIcon, { backgroundColor: theme.muted }]}>
                  <Feather name={step.icon} size={16} color={theme.text} />
                </View>
                <View style={styles.stepTextBlock}>
                  <ThemedText style={styles.stepNumber}>
                    Step {i + 1}
                  </ThemedText>
                  <ThemedText style={styles.stepText}>{step.label}</ThemedText>
                </View>
                <Feather name='chevron-right' size={16} color={theme.subtext} />
              </View>
              {i < ONBOARD_STEPS.length - 1 ? (
                <View
                  style={[styles.stepDivider, { backgroundColor: theme.border }]}
                />
              ) : null}
            </View>
          ))}
        </View>

        <HapticPressable
          onPress={startOnboarding}
          hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.accent, opacity: pressed ? 0.92 : 1 },
          ]}>
          <Feather name='plus-circle' size={20} color={theme.onAccent} />
          <ThemedText style={[styles.primaryBtnText, { color: theme.onAccent }]}>
            Start Worker Registration
          </ThemedText>
        </HapticPressable>

        <ThemedText style={[styles.footerNote, { color: theme.subtext }]}>
          Free to join · No commission · You control your availability
        </ThemedText>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Layout.sectionGap - 8,
  },
  heroCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Layout.cardRadius,
    padding: 24,
    gap: 12,
    borderCurve: 'continuous',
  },
  heroIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
  },
  heroBadgeText: {
    color: 'rgba(250,247,242,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    ...Typography.title,
    fontSize: 22,
  },
  heroBody: {
    color: 'rgba(250,247,242,0.82)',
    fontSize: 15,
    lineHeight: 22,
  },
  benefitsGrid: {
    paddingHorizontal: Layout.screenPadding,
    gap: 10,
  },
  benefitCard: {
    padding: 16,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    gap: 8,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: { fontSize: 15 },
  benefitBody: { fontSize: 13, lineHeight: 18 },
  stepsCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextBlock: { flex: 1, gap: 2 },
  stepNumber: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  stepText: { fontSize: 15, fontWeight: '600' },
  stepDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  primaryBtn: {
    marginHorizontal: Layout.screenPadding,
    minHeight: 54,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700' },
  footerNote: {
    textAlign: 'center',
    fontSize: 13,
    marginHorizontal: Layout.screenPadding,
    marginTop: -4,
  },
  profileCard: {
    marginHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 18, letterSpacing: -0.3 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: { fontSize: 12 },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlinePillText: { fontSize: 12, fontWeight: '600' },
  statusCard: {
    marginHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    gap: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 16 },
  statusSub: { fontSize: 13, lineHeight: 18 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Layout.screenPadding,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  completenessBanner: {
    marginHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  completenessText: { flex: 1, fontSize: 13, lineHeight: 18 },
  completenessCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
  },
  completenessCtaText: { fontSize: 13, fontWeight: '700' },
  actionsCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Layout.screenPadding + 52,
  },
});
