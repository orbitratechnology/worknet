import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import {
  useFieldStyle,
  useSurfaceStyle,
} from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { deleteUserAccount } from '@/lib/account-deletion';
import { getUserFacingMessage } from '@/lib/user-errors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const surfaceStyle = useSurfaceStyle();
  const fieldStyle = useFieldStyle();
  const { contentBottom } = useScreenInsets();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  const runDelete = async (reauthPassword?: string) => {
    try {
      setLoading(true);
      await deleteUserAccount(reauthPassword);
      router.replace('/(tabs)/profile');
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : '';

      if (code === 'auth/requires-recent-login') {
        const usesPassword = user?.providerData.some(
          (p) => p.providerId === 'password',
        );
        if (usesPassword) {
          setPasswordModalVisible(true);
          return;
        }
      }

      Alert.alert(
        'Could not delete account',
        getUserFacingMessage(error, 'delete'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose your profile data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void runDelete();
          },
        },
      ],
    );
  };

  const confirmPasswordDelete = async () => {
    setPasswordModalVisible(false);
    await runDelete(password);
    setPassword('');
  };

  return (
    <ScreenShell>
      <StackHeader title='Settings' border />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionLabel, { color: theme.subtext }]}>
          DANGER ZONE
        </ThemedText>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.error + '40' },
            surfaceStyle,
          ]}>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleDeleteAccount}
            disabled={loading}>
            <Feather name='trash-2' size={20} color={theme.error} />
            <ThemedText
              style={[styles.deleteText, { color: theme.error }]}
              selectable>
              {loading ? 'Deleting...' : 'Delete Account'}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText style={[styles.hint, { color: theme.subtext }]} selectable>
          This permanently removes your account, worker profile, photos, and
          private verification data. Reviews you wrote may appear as from
          &quot;Deleted User&quot;.
        </ThemedText>
      </ScrollView>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              surfaceStyle,
            ]}>
            <ThemedText type='defaultSemiBold' style={styles.modalTitle}>
              Confirm your password
            </ThemedText>
            <ThemedText style={{ color: theme.subtext, marginBottom: 12 }}>
              For your security, enter your password to delete your account.
            </ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder='Password'
              placeholderTextColor={theme.subtext}
              style={[
                styles.passwordInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.background,
                },
                fieldStyle,
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPassword('');
                }}
                style={styles.modalBtn}>
                <ThemedText style={{ color: theme.subtext }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => void confirmPasswordDelete()}
                style={styles.modalBtn}>
                <ThemedText style={{ color: theme.error, fontWeight: '600' }}>
                  Delete
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Layout.screenPadding,
    gap: Layout.itemGap,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  section: {
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  row: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: Layout.minTouch,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    padding: 20,
    gap: 8,
  },
  modalTitle: { fontSize: 18 },
  passwordInput: {
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    height: Layout.inputHeight,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 4,
  },
  modalBtn: {
    minHeight: Layout.minTouch,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
