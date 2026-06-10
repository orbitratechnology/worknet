import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { deleteUser } from '@react-native-firebase/auth';
import { deleteDoc, doc } from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { contentBottom } = useScreenInsets();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const currentUser = auth.currentUser;
              if (currentUser) {
                try {
                  await deleteDoc(doc(db, 'users', currentUser.uid));
                } catch (deleteUserDocError) {
                  console.error('Error deleting user doc:', deleteUserDocError);
                }

                try {
                  await deleteDoc(
                    doc(db, 'service_providers', currentUser.uid),
                  );
                } catch {
                  // Provider doc may not exist
                }

                await deleteUser(currentUser);
              }
            } catch (error: any) {
              console.error('Error deleting account:', error);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Security Check',
                  'For security, you must re-authenticate before deleting your account. Please log out and log back in.',
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to delete account. Please try again later.',
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
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
          This is a permanent action and cannot be undone.
        </ThemedText>
      </ScrollView>
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
    borderWidth: 1,
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
  },
});
