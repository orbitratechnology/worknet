import { ThemedText } from '@/components/themed-text';
import { StackHeader } from '@/components/ui/stack-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useFieldStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { uploadLocalFile } from '@/lib/storage';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, userProfile, updateUserProfile } = useAuth();
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const { bottom } = useScreenInsets();

  // Form State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
      setPhotoUrl(userProfile.photoUrl || user?.photoURL || '');
    }
  }, [userProfile, user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const uri = result.assets[0].uri;
        const extension = uri.split('.').pop();
        const path = `profile_photos/${user?.uid}/${Date.now()}.${extension}`;

        const downloadUrl = await uploadLocalFile(uri, path);
        setPhotoUrl(downloadUrl);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateUserProfile({
        name: name.trim(),
        bio: bio.trim(),
        photoUrl: photoUrl,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const profileImageUrl =
    photoUrl ||
    'https://ui-avatars.com/api/?name=' +
      (name || 'User') +
      '&background=000000&color=FFFFFF';

  return (
    <ScreenShell>
      <StackHeader title='Edit Profile' border />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={pickImage}
                disabled={isUploading}
                style={styles.avatarContainer}>
                <Image
                  source={profileImageUrl}
                  style={[styles.avatar, { borderColor: theme.border }]}
                />
                {isUploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color={theme.onAccent} />
                  </View>
                )}
                <View
                  style={[
                    styles.editIconBadge,
                    { backgroundColor: theme.accent, borderColor: theme.card },
                  ]}>
                  {isUploading ? (
                    <ActivityIndicator size='small' color={theme.onAccent} />
                  ) : (
                    <Feather name='camera' size={16} color={theme.onAccent} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickImage} disabled={isUploading}>
                <ThemedText
                  style={[styles.changePhotoText, { color: theme.accent }]}
                  type='defaultSemiBold'>
                  {isUploading ? 'Uploading...' : 'Change Profile Photo'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText
                  style={[styles.label, { color: theme.text }]}
                  type='defaultSemiBold'>
                  Full Name
                </ThemedText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                    fieldStyle,
                  ]}
                  placeholder='Enter your name'
                  placeholderTextColor={theme.subtext}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText
                  style={[styles.label, { color: theme.text }]}
                  type='defaultSemiBold'>
                  Bio
                </ThemedText>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                    fieldStyle,
                  ]}
                  placeholder='Tell us about yourself...'
                  placeholderTextColor={theme.subtext}
                  multiline
                  maxLength={300}
                />
                <ThemedText
                  style={[styles.charCount, { color: theme.subtext }]}>
                  {bio.length} / 300 characters
                </ThemedText>
              </View>
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.divider,
              paddingBottom: Math.max(bottom, 16),
            },
          ]}>
          <TouchableOpacity
            disabled={isSaving}
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: theme.accent },
            ]}>
            {isSaving ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <>
                <Feather name='save' size={20} color={theme.onAccent} />
                <ThemedText
                  style={[styles.saveButtonText, { color: theme.onAccent }]}
                  type='defaultSemiBold'>
                  Save Changes
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  changePhotoText: {
    fontSize: 15,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    height: Layout.inputHeight + 2,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    textAlignVertical: 'top',
    borderRadius: Layout.fieldRadius,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginRight: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    height: Layout.inputHeight + 4,
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveButtonText: {
    fontSize: 16,
  },
});
