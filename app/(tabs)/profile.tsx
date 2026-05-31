import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { db } from '@/lib/firebase';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';

const SettingRow = React.memo(function SettingRow({
  icon,
  title,
  value,
  showArrow = true,
  iconColor,
  onPress,
  theme,
  iconBoxStyle,
}: any) {
  const effectiveIconColor = iconColor || theme.text;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        pressed &&
          onPress && {
            backgroundColor: theme.secondaryBackground,
            opacity: 0.7,
          },
      ]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
            },
            iconBoxStyle,
          ]}>
          <Feather name={icon} size={18} color={effectiveIconColor} />
        </View>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      </View>
      <View style={styles.settingRight}>
        {value &&
          (typeof value === 'string' ? (
            <ThemedText style={[styles.settingValue, { color: theme.subtext }]}>
              {value}
            </ThemedText>
          ) : (
            <View style={styles.settingValueContainer}>{value}</View>
          ))}
        {showArrow && (
          <Feather name='chevron-right' size={16} color={theme.icon} />
        )}
      </View>
    </Pressable>
  );
});

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, userProfile } = useAuth();
  const { requireAuth } = useRequireAuth();
  const theme = useTheme();
  const { contentBottom } = useScreenInsets({ tabBar: true });

  const [userData, setUserData] = useState<any>(null);
  const [providerData, setProviderData] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [providerStatus, setProviderStatus] = useState<'online' | 'offline'>(
    'online',
  );

  const isProvider = !!userProfile?.isServiceProvider;

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    let unsubscribeProvider: () => void;
    if (userProfile?.isServiceProvider) {
      unsubscribeProvider = onSnapshot(
        doc(db, 'service_providers', user.uid),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setProviderData(data);
            setProviderStatus(data.availabilityStatus || 'online');
          }
        },
      );
    }

    return () => {
      unsubscribeUser();
      unsubscribeProvider?.();
    };
  }, [user?.uid, userProfile?.isServiceProvider]);

  const profileImageUrl =
    userData?.photoUrl ||
    user?.photoURL ||
    'https://ui-avatars.com/api/?name=' +
      (userData?.fullName || 'User') +
      '&background=000000&color=FFFFFF';

  if (!user) {
    return (
      <ScreenShell>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottom },
          ]}>
          <ScreenHeader title='Profile' />

          <View
              style={[
                styles.profileCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <View style={styles.profileInfo}>
                <ThemedText style={styles.profileNameMain} selectable>
                  Browse without signing in
                </ThemedText>
                <ThemedText
                  style={[styles.profileEmail, { color: theme.subtext }]}
                  selectable>
                  Sign in to save providers, leave reviews, or offer your
                  services.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/login')}
                  style={[
                    styles.badgeProfile,
                    { backgroundColor: theme.accent, marginTop: 12 },
                  ]}>
                  <ThemedText
                    style={[styles.badgeTextProfile, { color: theme.onAccent }]}>
                    Sign In
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/register')}
                  style={[
                    styles.badgeProfile,
                    {
                      backgroundColor: theme.surface,
                      borderWidth: 1,
                      borderColor: theme.border,
                      marginTop: 8,
                    },
                  ]}>
                  <ThemedText
                    style={[styles.badgeTextProfile, { color: theme.text }]}>
                    Create Account
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.subtext }]}>
                PREFERENCES
              </ThemedText>
              <View
                style={[
                  styles.cardGroup,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <SettingRow
                  icon='file-text'
                  title='Privacy Policy'
                  theme={theme}
                  onPress={() =>
                    WebBrowser.openBrowserAsync('https://orbitratech.net')
                  }
                />
                <View
                  style={[styles.divider, { backgroundColor: theme.border }]}
                />
                <SettingRow
                  icon='help-circle'
                  title='Help & Support'
                  theme={theme}
                  onPress={() => Linking.openURL('mailto:admin@orbitratech.net')}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <ThemedText style={[styles.versionText, { color: theme.subtext }]}>
                Worknet v1.0.0
              </ThemedText>
            </View>
          </ScrollView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottom },
        ]}>
        <ScreenHeader title='Profile' />

        {/* Profile Card */}
        <View style={styles.profileSection}>
            {isProvider ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => router.push('/(app)/provider-profile')}
                style={[
                  styles.providerCardPremium,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Image
                  source={providerData?.imageUrl || profileImageUrl}
                  style={styles.avatarLarge}
                />
                <View style={styles.profileInfo}>
                  <ThemedText style={styles.profileNameMain}>
                    {providerData?.name ||
                      userData?.name ||
                      user?.displayName ||
                      'Provider'}
                  </ThemedText>
                  <ThemedText
                    style={[styles.profileEmail, { color: theme.subtext }]}>
                    {providerData?.primaryProfession || 'Professional'}
                  </ThemedText>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 4,
                      gap: 4,
                    }}>
                    <MaterialCommunityIcons
                      name='star'
                      size={14}
                      color={theme.text}
                    />
                    <ThemedText style={{ fontSize: 13, fontWeight: '600' }}>
                      {providerData?.rating?.toFixed(1) || '5.0'}
                    </ThemedText>
                  </View>
                </View>
                <Feather name='chevron-right' size={20} color={theme.subtext} />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.profileCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Image source={profileImageUrl} style={styles.avatarLarge} />
                <View style={styles.profileInfo}>
                  <ThemedText style={styles.profileNameMain}>
                    {userData?.name || user?.displayName || 'User'}
                  </ThemedText>
                  <ThemedText
                    style={[styles.profileEmail, { color: theme.subtext }]}>
                    {user?.email}
                  </ThemedText>
                  {userData?.bio && (
                    <ThemedText
                      style={[styles.profileBio, { color: theme.subtext }]}
                      numberOfLines={2}>
                      {userData.bio}
                    </ThemedText>
                  )}
                  <TouchableOpacity
                    onPress={() => router.push('/(app)/edit-profile')}
                    style={[
                      styles.badgeProfile,
                      { backgroundColor: theme.accent + '10' },
                    ]}>
                    <ThemedText
                      style={[
                        styles.badgeTextProfile,
                        { color: theme.accent },
                      ]}>
                      Edit Profile
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Provider Access Section */}
          <View style={styles.section}>
            {isProvider && (
              <View
                style={[
                  styles.cardGroup,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    marginBottom: 16,
                  },
                ]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: theme.accent + '10',
                          borderColor: theme.border,
                        },
                      ]}>
                      <Feather
                        name='activity'
                        size={18}
                        color={
                          providerStatus === 'online'
                            ? theme.online
                            : theme.subtext
                        }
                      />
                    </View>
                    <View>
                      <ThemedText style={styles.settingTitle}>
                        Ready for work?
                      </ThemedText>
                      <ThemedText
                        style={{ fontSize: 12, color: theme.subtext }}>
                        {providerStatus === 'online'
                          ? 'You are appearing in searches'
                          : 'You are currently hidden'}
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={providerStatus === 'online'}
                    onValueChange={async (val) => {
                      const newStatus = val ? 'online' : 'offline';
                      setProviderStatus(newStatus);
                      if (user?.uid) {
                        try {
                          await setDoc(
                            doc(db, 'service_providers', user.uid),
                            {
                              availabilityStatus: newStatus,
                              updatedAt: serverTimestamp(),
                            },
                            { merge: true },
                          );
                        } catch (e) {
                          console.error('Failed to update status:', e);
                        }
                      }
                    }}
                    trackColor={{ false: theme.border, true: theme.online }}
                    thumbColor='#fff'
                  />
                </View>
              </View>
            )}

            {!isProvider && (
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.enrollCardPremium,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  if (!requireAuth('Sign in to offer your service')) {
                    return;
                  }
                  router.push('/(app)/enroll-provider');
                }}>
                <View
                  style={[
                    styles.providerIconBox,
                    { backgroundColor: theme.text },
                  ]}>
                  <MaterialCommunityIcons
                    name='rocket-launch'
                    size={22}
                    color={theme.onAccent}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <ThemedText style={styles.providerCardTitle}>
                    Become a Provider
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, color: theme.subtext }}>
                    Start earning by offering your skills.
                  </ThemedText>
                </View>
                <Feather name='chevron-right' size={20} color={theme.subtext} />
              </TouchableOpacity>
            )}
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.subtext }]}>
              PREFERENCES
            </ThemedText>
            <View
              style={[
                styles.cardGroup,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              {/* <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        borderWidth: 1,
                      },
                    ]}>
                    <Feather name='bell' size={18} color={theme.text} />
                  </View>
                  <ThemedText style={styles.settingTitle}>
                    Notifications
                  </ThemedText>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.border, true: theme.accent }}
                  thumbColor='#fff'
                />
              </View>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              /> */}
              {/* <SettingRow
                icon='shield'
                title='Privacy & Security'
                theme={theme}
              />
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              /> */}
              <SettingRow
                icon='settings'
                title='Settings'
                theme={theme}
                onPress={() => router.push('/(app)/settings')}
              />
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <SettingRow
                icon='file-text'
                title='Privacy Policy'
                theme={theme}
                onPress={() =>
                  WebBrowser.openBrowserAsync('https://orbitratech.net')
                }
              />
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <SettingRow
                icon='help-circle'
                title='Help & Support'
                theme={theme}
                onPress={() => Linking.openURL('mailto:admin@orbitratech.net')}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Image
              source={require('@/assets/images/adaptive-icon.png')}
              style={[
                styles.footerLogo,
                { opacity: 0.1, tintColor: theme.text },
              ]}
              contentFit='contain'
            />
            <TouchableOpacity
              style={[styles.logoutBtn, { borderColor: theme.border }]}
              onPress={signOut}>
              <Feather name='log-out' size={18} color={theme.error} />
              <ThemedText
                style={[styles.logoutBtnText, { color: theme.error }]}>
                Log Out
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.versionText, { color: theme.subtext }]}>
              Worknet v1.0.0
            </ThemedText>
          </View>
        </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  profileSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Layout.sectionGap,
  },
  profileCard: {
    padding: 20,
    borderRadius: Layout.cardRadius,
    flexDirection: 'row',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3EEE6',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileNameMain: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  badgeProfile: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Layout.chipRadius,
  },
  badgeTextProfile: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: Layout.sectionGap,
    paddingHorizontal: Layout.screenPadding,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  providerCardPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  enrollCardPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  providerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  providerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardGroup: {
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  settingValueContainer: {
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 68,
    marginRight: 16,
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: 8,
    alignItems: 'center',
    gap: 16,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginBottom: -8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Layout.chipRadius,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
});
