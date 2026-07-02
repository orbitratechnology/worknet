import { WizardFooter, WizardScreen } from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { FormSection, formFieldStyles } from '@/components/ui/form-section';
import { FormFieldLabel } from '@/components/ui/form-field-label';
import { FieldInfoButton } from '@/components/ui/field-info-button';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { SocialLinkField } from '@/components/ui/social-link-field';
import {
  WORKER_LANGUAGES,
  WORKER_LANGUAGE_META,
  type WorkerLanguage,
} from '@/constants/worker-languages';
import { Layout, chipBorderWidth, getSurfaceStyle } from '@/constants/theme';
import { ExperienceYearsRange } from '@/types/database';
import { useAuth } from '@/context/auth';
import { useRequireWorkerIdentity } from '@/hooks/use-require-worker-identity';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import {
  useColorSchemeMode,
  useFieldStyle,
} from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { uploadLocalFile, workSamplePath } from '@/lib/storage';
import { getUserFacingMessage } from '@/lib/user-errors';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

const EXPERIENCE_OPTIONS: ExperienceYearsRange[] = [
  '0-1',
  '1-3',
  '3-5',
  '5-10',
  '10+',
];

const MAX_WORK_PHOTOS = 5;

export default function DetailsStep() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorSchemeMode();
  const fieldStyle = useFieldStyle();
  const { width: screenWidth } = useWindowDimensions();
  const { user } = useAuth();
  useRequireWorkerIdentity();
  const { draft, updateDraft, loaded } = useWorkerOnboarding();
  const [uploadingSample, setUploadingSample] = useState(false);
  const [whatsapp, setWhatsapp] = useState(draft.whatsappNumber);
  const [bio, setBio] = useState(draft.bio);
  const [baseRate, setBaseRate] = useState(draft.baseRate);
  const [experience, setExperience] = useState(draft.experienceYears);
  const [samples, setSamples] = useState<string[]>(draft.workSampleUris);
  const [emergency, setEmergency] = useState(draft.emergencyAvailability);
  const [instagram, setInstagram] = useState(draft.socialLinks.instagram ?? '');
  const [facebook, setFacebook] = useState(draft.socialLinks.facebook ?? '');
  const [tiktok, setTiktok] = useState(draft.socialLinks.tiktok ?? '');
  const [languages, setLanguages] = useState<string[]>(
    draft.languages.length ? draft.languages : ['Sinhala'],
  );

  const contentWidth = screenWidth - Layout.screenPadding * 2;
  const photoCellWidth = (contentWidth - Layout.itemGap) / 2;
  const photoCellHeight = photoCellWidth * 0.72;

  useEffect(() => {
    if (!loaded) return;
    setWhatsapp(draft.whatsappNumber);
    setBio(draft.bio);
    setBaseRate(draft.baseRate);
    setExperience(draft.experienceYears);
    setSamples(draft.workSampleUris);
    setEmergency(draft.emergencyAvailability);
    setInstagram(draft.socialLinks.instagram ?? '');
    setFacebook(draft.socialLinks.facebook ?? '');
    setTiktok(draft.socialLinks.tiktok ?? '');
    setLanguages(draft.languages.length ? draft.languages : ['Sinhala']);
  }, [
    loaded,
    draft.whatsappNumber,
    draft.bio,
    draft.baseRate,
    draft.experienceYears,
    draft.workSampleUris,
    draft.emergencyAvailability,
    draft.socialLinks,
    draft.languages,
  ]);

  const persistDetails = (patch: Parameters<typeof updateDraft>[0]) => {
    updateDraft(patch);
  };

  const persistSocial = (patch: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  }) => {
    persistDetails({
      socialLinks: {
        instagram,
        facebook,
        tiktok,
        ...patch,
      },
    });
  };

  const toggleLanguage = (language: string) => {
    setLanguages((current) => {
      const next = current.includes(language)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== language)
        : [...current, language];
      persistDetails({ languages: next });
      return next;
    });
  };

  const inputStyle = {
    color: theme.text,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    ...fieldStyle,
  };

  const chipSurface = (selected: boolean) => ({
    ...(selected ? {} : getSurfaceStyle(scheme, 'soft')),
    borderWidth: chipBorderWidth(scheme, selected),
  });

  const addSample = async () => {
    if (samples.length >= MAX_WORK_PHOTOS || !user?.uid) return;
    const remaining = MAX_WORK_PHOTOS - samples.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return;

    setUploadingSample(true);
    const picked = result.assets.slice(0, remaining);
    const uploaded: string[] = [];
    let failed = 0;

    try {
      for (let i = 0; i < picked.length; i++) {
        try {
          const url = await uploadLocalFile(
            picked[i].uri,
            workSamplePath(user.uid, samples.length + uploaded.length),
          );
          uploaded.push(url);
        } catch {
          failed += 1;
        }
      }

      if (uploaded.length > 0) {
        const next = [...samples, ...uploaded];
        setSamples(next);
        persistDetails({ workSampleUris: next });
      }

      if (failed > 0) {
        Alert.alert(
          'Some uploads failed',
          uploaded.length > 0
            ? `${uploaded.length} photo(s) added. ${failed} could not be uploaded. Try again.`
            : 'Could not upload your photos. Try again.',
        );
      }
    } finally {
      setUploadingSample(false);
    }
  };

  const removeSample = (index: number) => {
    const next = samples.filter((_, i) => i !== index);
    setSamples(next);
    persistDetails({ workSampleUris: next });
  };

  const next = async () => {
    await updateDraft({
      whatsappNumber: whatsapp,
      bio,
      baseRate,
      experienceYears: experience,
      workSampleUris: samples,
      emergencyAvailability: emergency,
      socialLinks: { instagram, facebook, tiktok },
      languages,
    });
    router.push('/(app)/become-worker/review');
  };

  return (
    <WizardScreen
      step={6}
      total={7}
      title='Optional details'
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onNext={next}
          nextLabel='Review'
          loading={uploadingSample}
        />
      }>
      <FormSection
        title='WhatsApp'
        hint='Leave blank to use your verified phone number on your profile.'
        icon='message-circle'
        variant='plain'>
        <TextInput
          value={whatsapp}
          onChangeText={(t) => {
            setWhatsapp(t);
            persistDetails({ whatsappNumber: t });
          }}
          placeholder='077 123 4567'
          placeholderTextColor={theme.subtext}
          keyboardType='phone-pad'
          accessibilityLabel='WhatsApp number'
          style={[formFieldStyles.input, inputStyle]}
        />
      </FormSection>

      <FormSection title='About you' icon='file-text' variant='plain'>
        <TextInput
          value={bio}
          onChangeText={(t) => {
            setBio(t);
            persistDetails({ bio: t });
          }}
          placeholder='Brief description of your experience'
          placeholderTextColor={theme.subtext}
          multiline
          accessibilityLabel='About you'
          style={[formFieldStyles.textarea, inputStyle]}
        />
      </FormSection>

      <FormSection title='Languages' icon='globe' variant='plain'>
        <View style={formFieldStyles.chipGrid}>
          {WORKER_LANGUAGES.map((language) => {
            const selected = languages.includes(language);
            const meta = WORKER_LANGUAGE_META[language as WorkerLanguage];
            return (
              <HapticPressable
                key={language}
                onPress={() => toggleLanguage(language)}
                style={[
                  formFieldStyles.chip,
                  styles.languageChip,
                  {
                    backgroundColor: selected ? theme.accent : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                  chipSurface(selected),
                ]}>
                <View
                  style={[
                    styles.languageGlyph,
                    {
                      backgroundColor: selected
                        ? theme.onAccent + '22'
                        : meta.accent + '18',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.languageGlyphText,
                      {
                        color: selected ? theme.onAccent : meta.accent,
                      },
                    ]}>
                    {meta.glyph}
                  </ThemedText>
                </View>
                <ThemedText
                  style={{
                    color: selected ? theme.onAccent : theme.text,
                    fontWeight: '600',
                    fontSize: 15,
                  }}>
                  {language}
                </ThemedText>
              </HapticPressable>
            );
          })}
        </View>
      </FormSection>

      <FormSection title='Experience' icon='award' variant='plain'>
        <View style={formFieldStyles.chipGrid}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <HapticPressable
              key={opt}
              onPress={() => {
                setExperience(opt);
                persistDetails({ experienceYears: opt });
              }}
              style={[
                formFieldStyles.chip,
                {
                  backgroundColor:
                    experience === opt ? theme.accent : theme.surface,
                  borderColor:
                    experience === opt ? theme.accent : theme.border,
                },
                chipSurface(experience === opt),
              ]}>
              <ThemedText
                style={{
                  color: experience === opt ? theme.onAccent : theme.text,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                {opt} yrs
              </ThemedText>
            </HapticPressable>
          ))}
        </View>
      </FormSection>

      <FormSection
        title='Hourly rate (LKR)'
        hint='Your starting hourly price in Sri Lankan Rupees.'
        icon='dollar-sign'
        variant='plain'>
        <TextInput
          value={baseRate}
          onChangeText={(t) => {
            setBaseRate(t);
            persistDetails({ baseRate: t });
          }}
          placeholder='1500'
          placeholderTextColor={theme.subtext}
          keyboardType='number-pad'
          accessibilityLabel='Hourly rate in LKR'
          style={[formFieldStyles.input, inputStyle]}
        />
      </FormSection>

      <FormSection
        title={`Work photos (${samples.length}/${MAX_WORK_PHOTOS})`}
        hint='Add up to 5 photos at once from your gallery. Good photos help customers trust your work.'
        icon='image'
        variant='plain'>
        {samples.length === 0 ? (
          <HapticPressable
            onPress={addSample}
            style={({ pressed }) => [
              styles.emptyPhotos,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
              fieldStyle,
            ]}>
            <View
              style={[styles.emptyPhotosIcon, { backgroundColor: theme.muted }]}>
              <Feather name='image' size={28} color={theme.text} />
            </View>
            <ThemedText style={styles.emptyPhotosTitle}>Add work photos</ThemedText>
            <ThemedText style={[styles.emptyPhotosSub, { color: theme.subtext }]}>
              Select one or more photos from your gallery
            </ThemedText>
          </HapticPressable>
        ) : (
          <View style={styles.photoGrid}>
            {samples.map((uri, i) => (
              <View
                key={uri}
                style={[
                  styles.photoCell,
                  { width: photoCellWidth, height: photoCellHeight },
                ]}>
                <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit='cover' />
                <HapticPressable
                  onPress={() => removeSample(i)}
                  style={[styles.removePhoto, { backgroundColor: theme.overlay }]}>
                  <Feather name='x' size={16} color='#FFFFFF' />
                </HapticPressable>
              </View>
            ))}
            {samples.length < MAX_WORK_PHOTOS ? (
              <HapticPressable
                onPress={addSample}
                style={({ pressed }) => [
                  styles.photoCell,
                  styles.addPhotoCell,
                  {
                    width: photoCellWidth,
                    height: photoCellHeight,
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    opacity: pressed ? 0.92 : 1,
                  },
                  fieldStyle,
                ]}>
                <Feather name='plus' size={28} color={theme.text} />
                <ThemedText style={[styles.addPhotoLabel, { color: theme.subtext }]}>
                  Add photo
                </ThemedText>
              </HapticPressable>
            ) : null}
          </View>
        )}
      </FormSection>

      <FormSection title='Social links' icon='link' variant='plain'>
        <View style={formFieldStyles.group}>
          <FormFieldLabel label='Instagram' />
          <SocialLinkField
            brand='instagram'
            value={instagram}
            onChangeText={(t) => {
              setInstagram(t);
              persistSocial({ instagram: t });
            }}
            placeholder='@yourhandle'
            accessibilityLabel='Instagram handle'
          />
        </View>
        <View style={formFieldStyles.group}>
          <FormFieldLabel label='Facebook' />
          <SocialLinkField
            brand='facebook'
            value={facebook}
            onChangeText={(t) => {
              setFacebook(t);
              persistSocial({ facebook: t });
            }}
            placeholder='Page name or URL'
            accessibilityLabel='Facebook page'
          />
        </View>
        <View style={formFieldStyles.groupLast}>
          <FormFieldLabel label='TikTok' />
          <SocialLinkField
            brand='tiktok'
            value={tiktok}
            onChangeText={(t) => {
              setTiktok(t);
              persistSocial({ tiktok: t });
            }}
            placeholder='@yourhandle'
            accessibilityLabel='TikTok handle'
          />
        </View>
      </FormSection>

      <View style={formFieldStyles.switchRow}>
        <View style={styles.switchLabelRow}>
          <ThemedText style={formFieldStyles.label}>Emergency availability</ThemedText>
          <FieldInfoButton
            title='Emergency availability'
            message='Turn on if you accept urgent jobs outside normal hours.'
          />
        </View>
        <Switch
          value={emergency}
          onValueChange={(val) => {
            setEmergency(val);
            persistDetails({ emergencyAvailability: val });
          }}
          trackColor={{ false: theme.border, true: theme.online }}
          thumbColor={theme.onAccent}
        />
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  languageChip: {
    paddingHorizontal: 14,
    minWidth: '47%',
    flexGrow: 1,
  },
  languageGlyph: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageGlyphText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyPhotos: {
    width: '100%',
    minHeight: 160,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.sectionGap,
    gap: 8,
  },
  emptyPhotosIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyPhotosTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyPhotosSub: {
    fontSize: 14,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.itemGap,
    width: '100%',
  },
  photoCell: {
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
    position: 'relative',
  },
  addPhotoCell: {
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
