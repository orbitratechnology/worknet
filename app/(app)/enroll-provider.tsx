import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { db, storage } from '@/lib/firebase';
import { getGeohash } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SKILL_LEVELS: ServiceProvider['skillLevel'][] = [
  'Beginner',
  'Intermediate',
  'Professional',
  'Expert',
];
const EXPERIENCE_YEARS = ['0–1', '1–3', '3–5', '5–10', '10+'];

export default function EnrollProviderScreen() {
  const { user, userProfile, refreshUser } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    userProfile?.photoUrl || null
  );

  // Form State
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    title: '',
    bio: '',
    nic: '',
    phoneNumber: userProfile?.phoneNumber || '',
    whatsappNumber: '',
    professions: '',
    selectedCategories: [] as string[],
    tags: '',
    experienceYears: '0–1',
    skillLevel: 'Beginner' as any,
    homeCity: '',
    coverageArea: 'Same city only' as any,
    travelWillingness: true,
    pricingType: 'Hourly' as any,
    baseRate: '',
    negotiable: true,
    languages: 'Sinhala',
    emergencyAvailability: false,
    contactMethod: 'Call' as any,
    workingDays: 'All days',
    workingHours: 'Morning',
  });

  const [locationState, setLocationState] = useState<{
    latitude: number;
    longitude: number;
    homeCity: string;
  } | null>(null);

  useEffect(() => {
    async function loadProviderData() {
      if (!user?.uid) return;
      try {
        const docSnap = await getDoc(doc(db, 'service_providers', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...formData,
            name: data.name || '',
            title: data.title || '',
            bio: data.bio || '',
            nic: data.nic || '',
            phoneNumber: data.phoneNumber || '',
            whatsappNumber: data.whatsappNumber || '',
            professions: Array.isArray(data.professions)
              ? data.professions.join(', ')
              : '',
            selectedCategories: data.categories || [],
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            experienceYears: data.experienceYears?.toString() || '0–1',
            skillLevel: data.skillLevel || 'Beginner',
            homeCity: data.location?.homeCity || '',
            coverageArea: data.coverageArea || 'Same city only',
            travelWillingness: data.travelWillingness ?? true,
            pricingType: data.pricing?.type || 'Hourly',
            baseRate: data.pricing?.baseRate?.toString() || '',
            negotiable: data.pricing?.negotiable ?? true,
            languages: Array.isArray(data.languages)
              ? data.languages.join(', ')
              : 'Sinhala',
            emergencyAvailability: data.emergencyAvailability ?? false,
            contactMethod: data.contactMethod || 'Call',
          });
          setProfilePhoto(data.imageUrl || null);
        }
      } catch (err) {
        console.error('Error loading provider data:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadProviderData();
  }, [user?.uid]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'We need location permission to find you.'
        );
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const city = address.city || address.subregion || address.district || '';
      setLocationState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        homeCity: city,
      });
      setFormData({ ...formData, homeCity: city });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to get your location.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!profilePhoto) {
      Alert.alert(
        'Photo Required',
        'Please upload a professional profile photo.'
      );
      return;
    }
    if (
      !formData.name ||
      !formData.professions ||
      !formData.phoneNumber ||
      !formData.homeCity
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in the required fields marked with *'
      );
      return;
    }

    setLoading(true);
    try {
      let photoUrl = profilePhoto;
      if (profilePhoto && !profilePhoto.startsWith('http')) {
        photoUrl = await uploadImage(
          profilePhoto,
          `profile_photos/${user.uid}/profile.jpg`
        );
      }

      const providerData: ServiceProvider = {
        id: user.uid,
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        nic: formData.nic,
        professions: formData.professions.split(',').map((s) => s.trim()),
        categories: formData.selectedCategories,
        tags: formData.tags.split(',').map((s) => s.trim()),
        rating: 5.0,
        reviewCount: 0,
        experienceYears: parseInt(formData.experienceYears) || 0,
        skillLevel: formData.skillLevel,
        languages: formData.languages.split(',').map((s) => s.trim()),
        location: {
          latitude: locationState?.latitude || 0,
          longitude: locationState?.longitude || 0,
          geohash: locationState
            ? getGeohash(locationState.latitude, locationState.longitude)
            : '',
          homeCity: formData.homeCity,
        },
        coverageArea: formData.coverageArea,
        travelWillingness: formData.travelWillingness,
        serviceRadius: 10,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        contactMethod: formData.contactMethod,
        imageUrl: photoUrl,
        isAvailable: true,
        emergencyAvailability: formData.emergencyAvailability,
        // workingDays: formData.workingDays,
        // workingHours: formData.workingHours,
        pricing: {
          type: formData.pricingType,
          baseRate: parseFloat(formData.baseRate) || 0,
          negotiable: formData.negotiable,
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(doc(db, 'service_providers', user.uid), providerData);
      await setDoc(
        doc(db, 'users', user.uid),
        {
          isServiceProvider: true,
          photoUrl: photoUrl,
          phoneNumber: formData.phoneNumber,
        },
        { merge: true }
      );

      await refreshUser();
      Alert.alert('Welcome!', 'Your provider profile is now active.', [
        { text: 'Great', onPress: () => router.replace('/(tabs)/profile') },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Optimization Failed',
        "We couldn't save your profile. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    label: string,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? theme.text : theme.card,
          borderColor: theme.border,
        },
      ]}>
      <ThemedText
        style={[
          styles.chipText,
          { color: isSelected ? theme.background : theme.text },
        ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  if (initialLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size='large' color={theme.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}>
            <Feather name='arrow-left' size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Professional Profile
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Identity Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.accent + '10' },
                ]}>
                <Feather name='user' size={18} color={theme.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>
                Identity & Contact
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.photo} />
              ) : (
                <View
                  style={[
                    styles.photoPlaceholder,
                    { backgroundColor: theme.secondaryBackground },
                  ]}>
                  <Feather name='camera' size={28} color={theme.subtext} />
                  <ThemedText style={styles.photoText}>Upload Photo</ThemedText>
                </View>
              )}
              <View
                style={[styles.editBadge, { backgroundColor: theme.accent }]}>
                <Feather name='edit-2' size={12} color={theme.onAccent} />
              </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Full Name *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.name}
                onChangeText={(name) => setFormData({ ...formData, name })}
                placeholder='As per your ID'
                placeholderTextColor={theme.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Phone Number *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.phoneNumber}
                onChangeText={(phoneNumber) =>
                  setFormData({ ...formData, phoneNumber })
                }
                keyboardType='phone-pad'
                placeholder='07x xxx xxxx'
                placeholderTextColor={theme.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <ThemedText style={styles.label}>Home City *</ThemedText>
                <TouchableOpacity
                  onPress={handleGetLocation}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                  <Feather name='map-pin' size={14} color={theme.accent} />
                  <ThemedText style={{ color: theme.accent, fontSize: 13 }}>
                    Use Current Location
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.homeCity}
                onChangeText={(homeCity) =>
                  setFormData({ ...formData, homeCity })
                }
                placeholder='e.g. Colombo 03'
                placeholderTextColor={theme.subtext}
              />
            </View>
          </View>

          {/* Service Profile Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.accent + '10' },
                ]}>
                <Feather name='briefcase' size={18} color={theme.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>
                Service Details
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Primary Profession *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.professions}
                onChangeText={(professions) =>
                  setFormData({ ...formData, professions })
                }
                placeholder='e.g. Electrician, Painter'
                placeholderTextColor={theme.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Years of Experience</ThemedText>
              <View style={styles.chipGrid}>
                {EXPERIENCE_YEARS.map((year) =>
                  renderOption(year, formData.experienceYears === year, () =>
                    setFormData({ ...formData, experienceYears: year })
                  )
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Skill Level</ThemedText>
              <View style={styles.chipGrid}>
                {SKILL_LEVELS.map((level) =>
                  renderOption(level, formData.skillLevel === level, () =>
                    setFormData({ ...formData, skillLevel: level })
                  )
                )}
              </View>
            </View>
          </View>

          {/* Pricing Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.accent + '10' },
                ]}>
                <Feather name='dollar-sign' size={18} color={theme.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>
                Pricing & Availability
              </ThemedText>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <ThemedText style={styles.label}>Base Rate (LKR)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.secondaryBackground,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.baseRate}
                  onChangeText={(baseRate) =>
                    setFormData({ ...formData, baseRate })
                  }
                  keyboardType='numeric'
                  placeholder='1500'
                  placeholderTextColor={theme.subtext}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Unit</ThemedText>
                <View style={styles.chipGrid}>
                  {renderOption(
                    'Hourly',
                    formData.pricingType === 'Hourly',
                    () => setFormData({ ...formData, pricingType: 'Hourly' })
                  )}
                  {renderOption('Fixed', formData.pricingType === 'Fixed', () =>
                    setFormData({ ...formData, pricingType: 'Fixed' })
                  )}
                </View>
              </View>
            </View>

            <View style={styles.switchRow}>
              <ThemedText style={styles.label}>
                Emergency Availability
              </ThemedText>
              <Switch
                value={formData.emergencyAvailability}
                onValueChange={(val) =>
                  setFormData({ ...formData, emergencyAvailability: val })
                }
                trackColor={{ false: theme.border, true: theme.accent }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}>
            <LinearGradient
              colors={[theme.accent, theme.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}>
              {loading ? (
                <ActivityIndicator color={theme.onAccent} />
              ) : (
                <>
                  <ThemedText
                    style={[styles.submitText, { color: theme.onAccent }]}>
                    Activate Marketplace Presence
                  </ThemedText>
                  <Feather
                    name='arrow-right'
                    size={20}
                    color={theme.onAccent}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  photoPicker: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  photoText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#2E5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
