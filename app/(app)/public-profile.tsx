import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { cardShadow, Layout } from '@/constants/theme';
import { db } from '@/lib/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
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
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

function StatColumn({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const { bottom } = useScreenInsets();

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const url = `whatsapp://send?phone=${cleanNumber}`;
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
    if (!id) {
      setLoading(false);
      setError('Missing provider ID.');
      return;
    }
    setError(null);
    try {
      const docSnap = await getDoc(doc(db, 'service_providers', id as string));
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
  }, [id]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

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

  const heroImage =
    provider.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      provider.name,
    )}&background=222222&color=FAF7F2&size=512&bold=true`;
  const isOnline = provider.availabilityStatus === 'online';

  return (
    <ScreenShell>
      <StackHeader
        title={provider.title || provider.name || 'Provider'}
        right={
          <Pressable hitSlop={8} style={{ padding: 4 }}>
            <Feather name='share-2' size={20} color={theme.text} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroWrap, { backgroundColor: theme.muted }]}>
          <Image
            source={heroImage}
            style={styles.heroImage}
            contentFit='cover'
            transition={300}
          />
          <View style={[styles.heroRating, { backgroundColor: theme.overlay }]}>
            <Feather name='star' size={12} color='#FFFFFF' />
            <ThemedText style={styles.heroRatingText} selectable>
              {provider.rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.providerName} type='title' selectable>
                {provider.name}
              </ThemedText>
              {provider.isVerified ? (
                <View
                  style={[styles.verifiedBadge, { backgroundColor: theme.text }]}>
                  <Feather name='check' size={10} color={theme.onAccent} />
                  <ThemedText
                    style={[styles.verifiedText, { color: theme.onAccent }]}>
                    Verified
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText
              style={[styles.providerRole, { color: theme.subtext }]}
              selectable>
              {provider.primaryProfession}
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <StatColumn
              label='Experience'
              value={`${provider.experienceYears || 0}+ yrs`}
            />
            <StatColumn
              label='Location'
              value={provider.location?.homeCity || 'Nearby'}
            />
            <StatColumn
              label='Language'
              value={provider.languages?.[0] || 'English'}
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
              Service area
            </ThemedText>
            <View style={[styles.chip, { backgroundColor: theme.muted }]}>
              <Feather name='map-pin' size={12} color={theme.text} />
              <ThemedText style={styles.chipText} selectable>
                {provider.location?.homeCity}
                {provider.location?.country
                  ? `, ${provider.location.country}`
                  : ''}{' '}
                · {provider.serviceRadius || 25} km radius
              </ThemedText>
            </View>
          </View>

          {provider.workSamples && provider.workSamples.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type='headline' selectable>
                Recent work
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioScroll}>
                {provider.workSamples.map((url, index) => (
                  <Image
                    key={`work-sample-${index}-${url}`}
                    source={url}
                    style={[
                      styles.portfolioThumb,
                      { backgroundColor: theme.muted },
                    ]}
                    contentFit='cover'
                    transition={200}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

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

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

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
  heroWrap: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroRating: {
    position: 'absolute',
    bottom: 16,
    left: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.chipRadius,
  },
  heroRatingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 20,
    gap: Layout.sectionGap,
  },
  titleBlock: {
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerName: {
    fontSize: 26,
    letterSpacing: -0.6,
  },
  providerRole: {
    fontSize: 15,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.chipRadius,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
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
  portfolioScroll: {
    gap: 12,
    paddingRight: Layout.screenPadding,
  },
  portfolioThumb: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderCurve: 'continuous',
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
