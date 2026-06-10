import {
  WizardFooter,
  WizardHint,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { FormSection, formFieldStyles } from '@/components/ui/form-section';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { useAuth } from '@/context/auth';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { profilePhotoPath, uploadLocalFile } from '@/lib/storage';
import { isValidName } from '@/lib/validation';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

export default function IdentityStep() {
  const router = useRouter();
  const theme = useTheme();
  const { user, userProfile } = useAuth();
  const { draft, updateDraft } = useWorkerOnboarding();
  const [name, setName] = useState(draft.name);
  const [imageUri, setImageUri] = useState<string | null>(draft.imageUri);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!name && userProfile?.name) setName(userProfile.name);
    if (!imageUri && (userProfile?.photoUrl || user?.photoURL)) {
      setImageUri(userProfile?.photoUrl || user?.photoURL || null);
    }
  }, [userProfile, user, name, imageUri]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0] && user?.uid) {
      setUploading(true);
      try {
        const url = await uploadLocalFile(
          result.assets[0].uri,
          profilePhotoPath(user.uid),
        );
        setImageUri(url);
      } catch {
        Alert.alert('Upload failed', 'Could not upload your photo. Try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const next = async () => {
    if (!isValidName(name)) {
      setError('Enter your full name (2–60 characters).');
      return;
    }
    if (!imageUri) {
      setError('A profile photo is required.');
      return;
    }

    await updateDraft({ name: name.trim(), imageUri });
    router.push('/(app)/become-worker/verification');
  };

  return (
    <WizardScreen
      step={2}
      total={7}
      title='Your identity'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!name.trim() || !imageUri}
          loading={uploading}
        />
      }>
      <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
        This is how customers will recognize you in search results.
      </ThemedText>

      <HapticPressable onPress={pickImage} style={styles.photoWrap}>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={styles.photo} />
            <View
              style={[styles.photoBadge, { backgroundColor: theme.accent }]}>
              <Feather name='camera' size={14} color={theme.onAccent} />
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.photoPlaceholder,
              { borderColor: theme.border },
            ]}>
            <Feather name='camera' size={28} color={theme.subtext} />
            <ThemedText style={{ color: theme.subtext, fontWeight: '600' }}>
              Add photo
            </ThemedText>
            <ThemedText style={{ color: theme.subtext, fontSize: 12 }}>
              Required
            </ThemedText>
          </View>
        )}
      </HapticPressable>

      <FormSection title='Full name' icon='user' variant='plain'>
        <View style={formFieldStyles.group}>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError('');
            }}
            placeholder='Your name as customers will see it'
            placeholderTextColor={theme.subtext}
            style={[
              formFieldStyles.input,
              {
                color: theme.text,
                borderColor: error ? theme.error : theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          />
          {error ? (
            <ThemedText
              style={[formFieldStyles.hint, { color: theme.error }]}>
              {error}
            </ThemedText>
          ) : null}
        </View>
      </FormSection>

      <WizardHint>
        Use a clear, friendly photo of your face. Profiles with photos get
        more contact requests.
      </WizardHint>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  photoWrap: { alignSelf: 'center', marginBottom: 24 },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
