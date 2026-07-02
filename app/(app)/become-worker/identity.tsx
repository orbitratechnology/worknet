import {
  WizardFooter,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { FormSection, formFieldStyles } from '@/components/ui/form-section';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import {
  useSyncDraftField,
  useWorkerOnboarding,
} from '@/hooks/use-worker-onboarding';
import {
  useFieldStyle,
} from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { nextStepAfterIdentity } from '@/lib/user-identity';
import { profilePhotoPath, uploadLocalFile } from '@/lib/storage';
import { getUserFacingMessage } from '@/lib/user-errors';
import { isValidName } from '@/lib/validation';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

export default function IdentityStep() {
  const router = useRouter();
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const { user, userProfile } = useAuth();
  const { draft, updateDraft, loaded } = useWorkerOnboarding();
  const [name, setName] = useSyncDraftField('name');
  const [imageUri, setImageUri] = useState<string | null>(draft.imageUri);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const didPrefillName = useRef(false);

  useEffect(() => {
    if (!loaded) return;
    if (draft.imageUri) setImageUri(draft.imageUri);
  }, [loaded, draft.imageUri]);

  useEffect(() => {
    if (!loaded || didPrefillName.current) return;
    didPrefillName.current = true;
    if (draft.name.trim()) return;

    const fallback = userProfile?.name || user?.displayName;
    if (fallback) setName(fallback);
  }, [loaded, draft.name, userProfile?.name, user?.displayName, setName]);

  useEffect(() => {
    if (!loaded || imageUri) return;
    const fallback = userProfile?.photoUrl || user?.photoURL;
    if (fallback) {
      setImageUri(fallback);
      updateDraft({ imageUri: fallback });
    }
  }, [loaded, imageUri, userProfile?.photoUrl, user?.photoURL, updateDraft]);

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
        await updateDraft({ imageUri: url });
      } catch (e) {
        Alert.alert('Upload failed', getUserFacingMessage(e, 'upload'));
      } finally {
        setUploading(false);
      }
    }
  };

  const next = async () => {
    if (!isValidName(name)) {
      setError('Please enter your full name (2 to 60 characters).');
      return;
    }
    if (!imageUri) {
      setError('Please add a profile photo to continue.');
      return;
    }

    await updateDraft({ name: name.trim(), imageUri });
    router.push(nextStepAfterIdentity(userProfile));
  };

  return (
    <WizardScreen
      step={2}
      total={7}
      title='Your name and photo'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextDisabled={!name.trim() || !imageUri}
          loading={uploading}
        />
      }>
      <FormSection
        title='Profile photo'
        hint='Required. Use a clear photo of your face. Profiles with photos get more contact requests.'
        icon='camera'
        variant='plain'>
        <HapticPressable
          onPress={pickImage}
          style={({ pressed }) => [
            styles.photoCard,
            {
              borderColor: imageUri ? theme.accent : theme.border,
              backgroundColor: theme.surface,
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
              borderWidth: fieldStyle.borderWidth,
              boxShadow: imageUri ? undefined : fieldStyle.boxShadow,
            },
          ]}>
          {imageUri ? (
            <View style={styles.photoRow}>
              <Image source={{ uri: imageUri }} style={styles.photo} />
              <View style={styles.photoMeta}>
                <ThemedText style={styles.photoTitle}>Photo added</ThemedText>
                <ThemedText style={[styles.photoAction, { color: theme.subtext }]}>
                  Tap to change
                </ThemedText>
              </View>
              <View
                style={[styles.photoBadge, { backgroundColor: theme.accent }]}>
                <Feather name='camera' size={16} color={theme.onAccent} />
              </View>
            </View>
          ) : (
            <View style={styles.photoEmpty}>
              <View
                style={[styles.photoIcon, { backgroundColor: theme.muted }]}>
                <Feather name='camera' size={24} color={theme.text} />
              </View>
              <ThemedText style={styles.photoTitle}>Add your photo</ThemedText>
              <ThemedText style={[styles.photoAction, { color: theme.subtext }]}>
                Tap here to open your gallery
              </ThemedText>
            </View>
          )}
        </HapticPressable>
      </FormSection>

      <FormSection title='Full name' icon='user' variant='plain'>
        <View style={formFieldStyles.groupLast}>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError('');
            }}
            placeholder='e.g. Kamal Perera'
            placeholderTextColor={theme.subtext}
            autoCapitalize='words'
            accessibilityLabel='Full name'
            style={[
              formFieldStyles.input,
              {
                color: theme.text,
                borderColor: error ? theme.error : theme.border,
                backgroundColor: theme.surface,
              },
              fieldStyle,
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
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    width: '100%',
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
    minHeight: Layout.fieldHeight + 32,
    justifyContent: 'center',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.blockGap,
    padding: Layout.blockGap,
    width: '100%',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  photoBadge: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.sectionGap,
    gap: 8,
    width: '100%',
  },
  photoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoMeta: { flex: 1, gap: 4 },
  photoTitle: { fontSize: 16, fontWeight: '700' },
  photoAction: { fontSize: 14, lineHeight: 18 },
});
