import {
  WizardFooter,
  WizardHint,
  WizardScreen,
} from '@/components/onboarding/wizard-shell';
import { ThemedText } from '@/components/themed-text';
import { FormSection, formFieldStyles } from '@/components/ui/form-section';
import { HapticPressable } from '@/components/ui/haptic-pressable';
import { WORKER_LANGUAGES } from '@/constants/worker-languages';
import { ExperienceYearsRange } from '@/types/database';
import { useAuth } from '@/context/auth';
import { useWorkerOnboarding } from '@/hooks/use-worker-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { uploadLocalFile, workSamplePath } from '@/lib/storage';
import { getUserFacingMessage } from '@/lib/user-errors';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

const EXPERIENCE_OPTIONS: ExperienceYearsRange[] = [
  '0-1',
  '1-3',
  '3-5',
  '5-10',
  '10+',
];

export default function DetailsStep() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { draft, updateDraft } = useWorkerOnboarding();
  const [uploadingSample, setUploadingSample] = useState(false);
  const [whatsapp, setWhatsapp] = useState(draft.whatsappNumber);
  const [bio, setBio] = useState(draft.bio);
  const [baseRate, setBaseRate] = useState(draft.baseRate);
  const [experience, setExperience] = useState(draft.experienceYears);
  const [samples, setSamples] = useState<string[]>(draft.workSampleUris);
  const [emergency, setEmergency] = useState(draft.emergencyAvailability);
  const [instagram, setInstagram] = useState(draft.socialLinks.instagram ?? '');
  const [facebook, setFacebook] = useState(draft.socialLinks.facebook ?? '');
  const [languages, setLanguages] = useState<string[]>(
    draft.languages.length ? draft.languages : ['Sinhala'],
  );

  const toggleLanguage = (language: string) => {
    setLanguages((current) => {
      if (current.includes(language)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== language);
      }
      return [...current, language];
    });
  };

  const inputStyle = {
    color: theme.text,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  };

  const addSample = async () => {
    if (samples.length >= 5 || !user?.uid) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploadingSample(true);
      try {
        const url = await uploadLocalFile(
          result.assets[0].uri,
          workSamplePath(user.uid, samples.length),
        );
        setSamples((s) => [...s, url]);
      } catch (e) {
        Alert.alert('Upload failed', getUserFacingMessage(e, 'upload'));
      } finally {
        setUploadingSample(false);
      }
    }
  };

  const next = async () => {
    await updateDraft({
      whatsappNumber: whatsapp,
      bio,
      baseRate,
      experienceYears: experience,
      workSampleUris: samples,
      emergencyAvailability: emergency,
      socialLinks: { instagram, facebook },
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
      <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
        Add more info to stand out — all fields here are optional.
      </ThemedText>

      <FormSection title='Contact' icon='message-circle' variant='plain'>
        <View style={formFieldStyles.group}>
          <ThemedText style={formFieldStyles.label}>WhatsApp</ThemedText>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder='Same as phone if empty'
            placeholderTextColor={theme.subtext}
            keyboardType='phone-pad'
            style={[formFieldStyles.input, inputStyle]}
          />
        </View>
      </FormSection>

      <FormSection title='About you' icon='file-text' variant='plain'>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder='Brief description of your experience'
          placeholderTextColor={theme.subtext}
          multiline
          style={[formFieldStyles.textarea, inputStyle]}
        />
      </FormSection>

      <FormSection title='Languages' icon='globe' variant='plain'>
        <ThemedText style={[formFieldStyles.hint, { color: theme.subtext }]}>
          Select all languages you can communicate in with customers.
        </ThemedText>
        <View style={formFieldStyles.chipGrid}>
          {WORKER_LANGUAGES.map((language) => {
            const selected = languages.includes(language);
            return (
              <HapticPressable
                key={language}
                onPress={() => toggleLanguage(language)}
                style={[
                  formFieldStyles.chip,
                  {
                    backgroundColor: selected ? theme.accent : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}>
                <ThemedText
                  style={{
                    color: selected ? theme.onAccent : theme.text,
                    fontWeight: '600',
                    fontSize: 13,
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
              onPress={() => setExperience(opt)}
              style={[
                formFieldStyles.chip,
                {
                  backgroundColor:
                    experience === opt ? theme.accent : theme.surface,
                  borderColor:
                    experience === opt ? theme.accent : theme.border,
                },
              ]}>
              <ThemedText
                style={{
                  color: experience === opt ? theme.onAccent : theme.text,
                  fontWeight: '600',
                  fontSize: 13,
                }}>
                {opt} yrs
              </ThemedText>
            </HapticPressable>
          ))}
        </View>
      </FormSection>

      <FormSection title='Pricing' icon='dollar-sign' variant='plain'>
        <TextInput
          value={baseRate}
          onChangeText={setBaseRate}
          placeholder='Hourly rate in LKR, e.g. 1500'
          placeholderTextColor={theme.subtext}
          keyboardType='number-pad'
          style={[formFieldStyles.input, inputStyle]}
        />
      </FormSection>

      <FormSection title='Work photos' icon='image' variant='plain'>
        <View style={styles.samples}>
          {samples.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.sampleImg} />
          ))}
          {samples.length < 5 ? (
            <HapticPressable
              onPress={addSample}
              style={[styles.addSample, { borderColor: theme.border }]}>
              <ThemedText style={{ color: theme.subtext, fontWeight: '600' }}>
                + Add
              </ThemedText>
            </HapticPressable>
          ) : null}
        </View>
      </FormSection>

      <FormSection title='Social links' icon='link' variant='plain'>
        <View style={formFieldStyles.group}>
          <TextInput
            value={instagram}
            onChangeText={setInstagram}
            placeholder='Instagram handle'
            placeholderTextColor={theme.subtext}
            style={[formFieldStyles.input, inputStyle]}
          />
          <TextInput
            value={facebook}
            onChangeText={setFacebook}
            placeholder='Facebook page URL'
            placeholderTextColor={theme.subtext}
            style={[formFieldStyles.input, inputStyle]}
          />
        </View>
      </FormSection>

      <View style={formFieldStyles.switchRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={formFieldStyles.label}>
            Emergency availability
          </ThemedText>
          <ThemedText style={[formFieldStyles.hint, { color: theme.subtext }]}>
            Show you accept urgent jobs
          </ThemedText>
        </View>
        <Switch
          value={emergency}
          onValueChange={setEmergency}
          trackColor={{ false: theme.border, true: theme.online }}
          thumbColor={theme.onAccent}
        />
      </View>

      <WizardHint>
        Profiles with photos, bio, and pricing get more contact requests.
      </WizardHint>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, lineHeight: 20 },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sampleImg: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  addSample: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
