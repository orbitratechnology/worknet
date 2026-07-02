import { ThemedText } from '@/components/themed-text';
import { ActionRow } from '@/components/ui/action-row';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { Layout, Typography } from '@/constants/theme';
import { WORKER_ONBOARDING_STEPS } from '@/constants/worker-onboarding-steps';
import { profileCompleteness } from '@/hooks/use-worker-onboarding';
import { useAuth } from '@/context/auth';
import { isIdentityVerified, maskNic } from '@/lib/user-identity';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useSurfaceStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { formatRatingDisplay, formatReviewCount } from '@/lib/ratings';
import { db } from '@/lib/firebase';
import { ServiceProvider } from '@/types/database';
import { UserProfile } from '@/types/user';
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
    body: 'Show up when customers search nearby.',
  },
  {
    icon: 'phone' as const,
    title: 'Direct contact',
    body: 'Customers call or WhatsApp you directly.',
  },
  {
    icon: 'shield' as const,
    title: 'You stay in control',
    body: 'Toggle availability anytime.',
  },
] as const;

const ONBOARD_STEPS = [
  { label: 'Verify NIC & phone', icon: 'shield' as const },
  { label: 'Add profession & city', icon: 'briefcase' as const },
  { label: 'Publish profile', icon: 'check-circle' as const },
] as const;

function WorkerRegistrationPrompt({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle();
  const elevatedSurface = useSurfaceStyle('elevated');

  return (
    <>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.text,
          },
          elevatedSurface,
        ]}>
        <View style={styles.heroTopRow}>
          <View
            style={[
              styles.heroIconWrap,
              { backgroundColor: 'rgba(255,255,255,0.12)' },
            ]}>
            <MaterialCommunityIcons
              name='hard-hat'
              size={24}
              color={theme.onAccent}
            />
          </View>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: 'rgba(255,255,255,0.15)' },
            ]}>
            <ThemedText style={styles.heroBadgeText}>About 5 minutes</ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.heroTitle, { color: theme.onAccent }]}>
          Start earning as a Worker
        </ThemedText>
        <ThemedText style={styles.heroBody}>
          List your skills once. Customers nearby can find and contact you.
        </ThemedText>

        <HapticPressable
          onPress={onRegister}
          hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          style={({ pressed }) => [
            styles.heroPrimaryBtn,
            {
              backgroundColor: theme.onAccent,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <ThemedText
            style={[styles.heroPrimaryBtnText, { color: theme.text }]}>
            Start Worker Registration
          </ThemedText>
          <Feather name='arrow-right' size={18} color={theme.text} />
        </HapticPressable>

        <ThemedText style={styles.heroFootnote}>
          Free to join. No commission. You control availability.
        </ThemedText>
      </View>

      <View
        style={[
          styles.benefitsCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          surfaceStyle,
        ]}>
        {ONBOARD_BENEFITS.map((benefit, index) => (
          <View key={benefit.title}>
            <View style={styles.benefitRow}>
              <View
                style={[styles.benefitIcon, { backgroundColor: theme.muted }]}>
                <Feather name={benefit.icon} size={16} color={theme.text} />
              </View>
              <View style={styles.benefitTextBlock}>
                <ThemedText style={styles.benefitTitle} type='defaultSemiBold'>
                  {benefit.title}
                </ThemedText>
                <ThemedText
                  style={[styles.benefitBody, { color: theme.subtext }]}>
                  {benefit.body}
                </ThemedText>
              </View>
            </View>
            {index < ONBOARD_BENEFITS.length - 1 ? (
              <View
                style={[styles.benefitDivider, { backgroundColor: theme.divider }]}
              />
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.stepsSection}>
        <ThemedText style={[styles.stepsLabel, { color: theme.subtext }]}>
          What you will complete
        </ThemedText>
        <View
          style={[
            styles.stepsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            surfaceStyle,
          ]}>
          {ONBOARD_STEPS.map((step, index) => (
            <View key={step.label}>
              <View style={styles.stepRow}>
                <View
                  style={[styles.stepIcon, { backgroundColor: theme.muted }]}>
                  <Feather name={step.icon} size={16} color={theme.text} />
                </View>
                <ThemedText style={styles.stepText}>{step.label}</ThemedText>
              </View>
              {index < ONBOARD_STEPS.length - 1 ? (
                <View
                  style={[styles.stepDivider, { backgroundColor: theme.divider }]}
                />
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

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
  const surfaceStyle = useSurfaceStyle();

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
          },
          surfaceStyle,
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
          opacity: pressed ? 0.88 : 1,
        },
        surfaceStyle,
      ]}>
      {content}
    </HapticPressable>
  );
}

function WorkerDashboard({
  data,
  userId,
  userProfile,
}: {
  data: ServiceProvider;
  userId: string;
  userProfile: UserProfile | null;
}) {
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle();
  const softSurface = useSurfaceStyle('soft');
  const router = useRouter();

  const completeness = profileCompleteness(
    {
      name: data.name,
      imageUri: data.imageUrl ?? null,
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
    },
    userProfile ?? undefined,
  );

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

  const quickActions = useMemo(
    () =>
      WORKER_ONBOARDING_STEPS.filter((step) => {
        if (step.step <= 1) return false;
        if (
          step.href.includes('verification') &&
          isIdentityVerified(userProfile)
        ) {
          return false;
        }
        return true;
      }).map((step) => ({
        icon: step.icon,
        title: step.label,
        subtitle: step.subtitle,
        href: step.href,
      })),
    [userProfile],
  );

  return (
    <>
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
            softSurface,
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

      {isIdentityVerified(userProfile) ? (
        <View
          style={[
            styles.actionsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            surfaceStyle,
          ]}>
          <SectionHeader title='Verified identity' />
          <View style={styles.identityRow}>
            <Feather name='credit-card' size={16} color={theme.subtext} />
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={[styles.identityLabel, { color: theme.subtext }]}>
                NIC
              </ThemedText>
              <ThemedText style={styles.identityValue}>
                {maskNic(userProfile!.nicNumber!)}
              </ThemedText>
            </View>
            <Feather name='lock' size={14} color={theme.subtext} />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.identityRow}>
            <Feather name='smartphone' size={16} color={theme.subtext} />
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={[styles.identityLabel, { color: theme.subtext }]}>
                Phone
              </ThemedText>
              <ThemedText style={styles.identityValue}>
                {userProfile!.phoneNumber}
              </ThemedText>
            </View>
            <Feather name='lock' size={14} color={theme.subtext} />
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.actionsCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          surfaceStyle,
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
                style={[styles.divider, { backgroundColor: theme.divider }]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {(data.socialLinks?.instagram ||
        data.socialLinks?.facebook ||
        data.socialLinks?.tiktok) ? (
        <View
          style={[
            styles.actionsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            surfaceStyle,
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
                  style={[styles.divider, { backgroundColor: theme.divider }]}
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
          {data.socialLinks.tiktok ? (
            <>
              {data.socialLinks.instagram || data.socialLinks.facebook ? (
                <View
                  style={[styles.divider, { backgroundColor: theme.divider }]}
                />
              ) : null}
              <ActionRow
                icon='music'
                title='TikTok'
                subtitle={data.socialLinks.tiktok}
                onPress={() => {
                  const handle = data.socialLinks!.tiktok!;
                  const url = handle.startsWith('http')
                    ? handle
                    : `https://tiktok.com/@${handle.replace('@', '')}`;
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
  const surfaceStyle = useSurfaceStyle();
  const { contentBottom } = useScreenInsets({ tabBar: true });
  const isWorker = !!userProfile?.isServiceProvider;
  const [workerData, setWorkerData] = useState<ServiceProvider | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!user?.uid || !isWorker) return;
    return onSnapshot(doc(db, 'service_providers', user.uid), (snap) => {
      if (snap.exists()) {
        setWorkerData({ ...(snap.data() as ServiceProvider), id: snap.id });
      }
    });
  }, [user?.uid, isWorker]);

  useEffect(() => {
    setOnline(workerData?.availabilityStatus === 'online');
  }, [workerData?.availabilityStatus]);

  const toggleAvailability = async (val: boolean) => {
    if (!user?.uid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const status = val ? 'online' : 'offline';
    setOnline(val);
    await setDoc(
      doc(db, 'service_providers', user.uid),
      { availabilityStatus: status, updatedAt: serverTimestamp() },
      { merge: true },
    );
  };

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
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              surfaceStyle,
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
            <Switch
              value={online}
              onValueChange={toggleAvailability}
              trackColor={{ false: theme.border, true: theme.online }}
              thumbColor={theme.onAccent}
              accessibilityLabel={
                online ? 'Available for jobs' : 'Not available for jobs'
              }
            />
          </View>

          <WorkerDashboard
            data={workerData}
            userId={user!.uid}
            userProfile={userProfile}
          />
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
        <WorkerRegistrationPrompt onRegister={startOnboarding} />
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
    padding: 22,
    gap: 10,
    borderCurve: 'continuous',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
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
    letterSpacing: -0.4,
  },
  heroBody: {
    color: 'rgba(250,247,242,0.82)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroPrimaryBtn: {
    marginTop: 6,
    minHeight: 52,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroFootnote: {
    color: 'rgba(250,247,242,0.65)',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 2,
  },
  benefitsCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  benefitTextBlock: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: { fontSize: 15 },
  benefitBody: { fontSize: 13, lineHeight: 18 },
  benefitDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  stepsSection: {
    gap: 10,
  },
  stepsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: Layout.screenPadding,
  },
  stepsCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, fontSize: 14, fontWeight: '600' },
  stepDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  profileCard: {
    marginHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Layout.cardRadius,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Layout.screenPadding,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: Layout.cardRadius,
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
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Layout.screenPadding + 52,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 14,
  },
  identityLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  identityValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
