import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { deleteUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const currentUser = auth.currentUser;
              if (currentUser) {
                // 1. Delete user document from Firestore
                try {
                  await deleteDoc(doc(db, 'users', currentUser.uid));
                } catch (e) {
                  console.error('Error deleting user doc:', e);
                }

                // 2. If provider, delete provider doc
                try {
                  await deleteDoc(
                    doc(db, 'service_providers', currentUser.uid),
                  );
                } catch (e) {
                  // ignore
                }

                // 3. Delete the user from Firebase Auth
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Feather name='arrow-left' size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={{ marginBottom: 12, paddingLeft: 4 }}>
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: theme.subtext,
              }}>
              DANGER ZONE
            </ThemedText>
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.card, borderColor: theme.error + '40' },
            ]}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleDeleteAccount}
              disabled={loading}>
              <View style={styles.rowContent}>
                <Feather
                  name='trash-2'
                  size={20}
                  color={theme.error}
                  style={{ marginRight: 12 }}
                />
                <ThemedText
                  style={{
                    color: theme.error,
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                  {loading ? 'Deleting...' : 'Delete Account'}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 12, paddingHorizontal: 4 }}>
            <ThemedText
              style={{
                fontSize: 12,
                color: theme.subtext,
                textAlign: 'center',
              }}>
              This is a permanent action and cannot be undone.
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
