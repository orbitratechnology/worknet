import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout, cardShadow } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useSavedProviders } from '@/hooks/use-saved-providers';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const SettingRow = React.memo(function SettingRow({
  icon,
  title,
  onPress,
  theme,
  destructive = false,
  badge,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  onPress?: () => void;
  theme: ReturnType<typeof useTheme>;
  destructive?: boolean;
  badge?: string;
}) {
  const color = destructive ? theme.error : theme.text;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress && { backgroundColor: theme.muted },
      ]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: destructive ? theme.error + '10' : theme.surface,
              borderColor: destructive ? theme.error + '25' : theme.border,
            },
          ]}>
          <Feather
            name={icon}
            size={18}
            color={destructive ? theme.error : theme.icon}
          />
        </View>
        <ThemedText style={[styles.settingTitle, { color }]} selectable>
          {title}
        </ThemedText>
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.muted }]}>
          <ThemedText style={[styles.badgeText, { color: theme.subtext }]}>
            {badge}
          </ThemedText>
        </View>
      ) : null}
      <Feather
        name='chevron-right'
        size={16}
        color={destructive ? theme.error : theme.icon}
      />
    </Pressable>
  );
});

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, userProfile } = useAuth();
  const { savedIds } = useSavedProviders();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const { contentBottom } = useScreenInsets({ tabBar: true });

  const displayName = userProfile?.name || user?.displayName || 'User';
  const profileImageUrl =
    userProfile?.photoUrl ||
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=222222&color=FAF7F2&bold=true&size=256`;

  if (!user) {
    return (
      <ScreenShell>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottom },
          ]}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader
            title='Account'
            subtitle='Sign in to access your profile and saved workers'
          />

          <View
            style={[
              styles.guestCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                boxShadow: cardShadow(scheme),
              },
            ]}>
            <View style={[styles.guestIconWrap, { backgroundColor: theme.muted }]}>
              <Feather name='user' size={32} color={theme.text} />
            </View>
            <ThemedText style={styles.guestTitle}>
              Join Worknet
            </ThemedText>
            <ThemedText style={[styles.guestSubtitle, { color: theme.subtext }]}>
              Sign in to book local workers, save your favorites, leave reviews, or start earning as a skilled worker.
            </ThemedText>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: '#FF6B6B15' },
                  ]}>
                  <Feather name='heart' size={16} color='#FF6B6B' />
                </View>
                <ThemedText style={styles.featureText}>
                  Save workers for quick access
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: '#FFD54F20' },
                  ]}>
                  <Feather name='star' size={16} color='#FFB300' />
                </View>
                <ThemedText style={styles.featureText}>
                  Leave reviews and ratings
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: theme.accent + '12' },
                  ]}>
                  <Feather name='briefcase' size={16} color={theme.accent} />
                </View>
                <ThemedText style={styles.featureText}>
                  Offer services & earn money
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/login')}
              style={({ pressed }) => [
                styles.guestPrimaryBtn,
                { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 },
              ]}>
              <ThemedText
                style={[styles.guestPrimaryBtnText, { color: theme.onAccent }]}>
                Sign In
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => router.push('/register')}
              style={({ pressed }) => [
                styles.guestSecondaryBtn,
                { borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
              ]}>
              <ThemedText style={styles.guestSecondaryBtnText}>
                Create Account
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText style={[styles.sectionLabel, { color: theme.subtext, marginTop: 8 }]}>
            Support & Legal
          </ThemedText>
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <SettingRow
              icon='help-circle'
              title='Help & Support'
              theme={theme}
              onPress={() => Linking.openURL('mailto:admin@orbitratech.net')}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingRow
              icon='file-text'
              title='Privacy Policy'
              theme={theme}
              onPress={() => WebBrowser.openBrowserAsync('https://orbitratech.net')}
            />
          </View>
        </ScrollView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader title='Account' />

        {/* Profile Header Block */}
        <Pressable
          onPress={() => router.push('/(app)/edit-profile')}
          style={({ pressed }) => [
            styles.profileHeaderPressable,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              boxShadow: cardShadow(scheme),
            },
            pressed && { opacity: 0.95 },
          ]}>
          <View style={styles.profileHeaderLeft}>
            <ThemedText style={styles.profileName} numberOfLines={1}>
              {displayName}
            </ThemedText>
            <ThemedText
              style={[styles.profileEmail, { color: theme.subtext }]}
              numberOfLines={1}>
              {user.email}
            </ThemedText>

            <View style={styles.profileBadgeRow}>
              <ThemedText
                style={[styles.profileBadgeText, { color: theme.accent }]}>
                Edit Profile
              </ThemedText>
              <Feather name='chevron-right' size={14} color={theme.accent} />
            </View>
          </View>
          <Image source={profileImageUrl} style={styles.avatarLarge} />
        </Pressable>

        {/* Saved Workers */}
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <SettingRow
            icon='heart'
            title='Saved Workers'
            theme={theme}
            onPress={() => router.push('/(app)/saved-workers')}
            badge={savedIds.length > 0 ? String(savedIds.length) : undefined}
          />
        </View>

        {/* Settings Section */}
        <ThemedText style={[styles.sectionLabel, { color: theme.subtext }]}>
          Settings
        </ThemedText>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <SettingRow
            icon='settings'
            title='Settings & Account'
            theme={theme}
            onPress={() => router.push('/(app)/settings')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingRow
            icon='help-circle'
            title='Help & Support'
            theme={theme}
            onPress={() => Linking.openURL('mailto:admin@orbitratech.net')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingRow
            icon='file-text'
            title='Privacy Policy'
            theme={theme}
            onPress={() => WebBrowser.openBrowserAsync('https://orbitratech.net')}
          />
        </View>

        {/* Log Out Group */}
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              marginTop: 8,
            },
          ]}>
          <SettingRow
            icon='log-out'
            title='Log Out'
            theme={theme}
            onPress={signOut}
            destructive
          />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeaderPressable: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap,
    padding: 20,
    borderRadius: Layout.cardRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  profileHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  profileBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: Layout.screenPadding,
    textTransform: 'uppercase',
  },
  cardGroup: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap,
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 66,
    opacity: 0.5,
  },
  // Guest state styling
  guestCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap,
    padding: 24,
    borderRadius: Layout.cardRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
    gap: 16,
  },
  guestIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  featuresList: {
    width: '100%',
    gap: 14,
    marginVertical: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestPrimaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: Layout.chipRadius,
    alignItems: 'center',
    marginTop: 8,
  },
  guestPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  guestSecondaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: Layout.chipRadius,
    alignItems: 'center',
    borderWidth: 1,
  },
  guestSecondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
