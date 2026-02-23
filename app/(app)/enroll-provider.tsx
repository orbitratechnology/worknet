import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { WORKER_TYPES } from '@/constants/worker-types';
import { useAuth } from '@/context/auth';
import { db, storage } from '@/lib/firebase';
import { getGeohash } from '@/lib/geo';
import { ServiceProvider } from '@/types/database';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
    userProfile?.photoUrl || null,
  );

  const [stats, setStats] = useState({
    rating: 5.0,
    reviewCount: 0,
  });

  // Form State
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    title: '',
    bio: '',
    nic: '',
    phoneNumber: userProfile?.phoneNumber || '',
    whatsappNumber: '',
    primaryProfession: '',
    secondaryProfessions: '',
    category: '',
    tags: '',
    experienceYears: '0–1',
    skillLevel: 'Beginner' as any,
    homeCity: '',
    country: '',
    coverageArea: 'Radius' as any,
    serviceRadius: 25,
    serviceCities: [] as string[],
    serviceDistricts: [] as string[],
    travelWillingness: true,
    pricingType: 'Hourly' as any,
    baseRate: '',
    negotiable: true,
    languages: 'Sinhala',
    emergencyAvailability: false,
    contactMethod: 'Call' as any,
    workingDays: 'All days',
    workingHours: 'Morning',
    workSamples: [] as string[],
    about: '',
  });

  const [locationState, setLocationState] = useState<{
    latitude: number;
    longitude: number;
    homeCity: string;
    country: string;
    geohash: string;
  } | null>(null);

  const [mapVisible, setMapVisible] = useState(false);
  const [professionModalVisible, setProfessionModalVisible] = useState(false);

  useEffect(() => {
    async function loadProviderData() {
      if (!user?.uid) return;
      try {
        const docSnap = await getDoc(doc(db, 'service_providers', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData((prev) => ({
            ...prev,
            name: data.name || '',
            title: data.title || '',
            bio: data.bio || '',
            nic: data.nic || '',
            phoneNumber: data.phoneNumber || '',
            whatsappNumber: data.whatsappNumber || '',
            primaryProfession: data.primaryProfession || '',
            secondaryProfessions: Array.isArray(data.secondaryProfessions)
              ? data.secondaryProfessions.join(', ')
              : '',
            category: data.category || '',
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            experienceYears: data.experienceYears?.toString() || '0–1',
            skillLevel: data.skillLevel || 'Beginner',
            homeCity: data.location?.homeCity || '',
            country: data.location?.country || '',
            coverageArea: data.coverageArea || 'Radius',
            serviceRadius: data.serviceRadius || 25,
            serviceCities: data.serviceCities || [],
            serviceDistricts: data.serviceDistricts || [],
            travelWillingness: data.travelWillingness ?? true,
            pricingType: data.pricing?.type || 'Hourly',
            baseRate: data.pricing?.baseRate?.toString() || '',
            negotiable: data.pricing?.negotiable ?? true,
            languages: Array.isArray(data.languages)
              ? data.languages.join(', ')
              : 'Sinhala',
            emergencyAvailability: data.emergencyAvailability ?? false,
            contactMethod: data.contactMethod || 'Call',
            workSamples: data.workSamples || [],
            about: data.about || '',
          }));
          setProfilePhoto(data.imageUrl || null);
          setStats({
            rating: data.rating || 5.0,
            reviewCount: data.reviewCount || 0,
          });

          if (data.location) {
            setLocationState({
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              homeCity: data.location.homeCity,
              country: data.location.country || '',
              geohash: data.location.geohash,
            });
          }
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
          'We need location permission to find you.',
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
      const country = address.country || '';
      const geohash = getGeohash(
        location.coords.latitude,
        location.coords.longitude,
      );
      setLocationState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        homeCity: city,
        country,
        geohash,
      });
      setFormData({ ...formData, homeCity: city, country });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to get your location.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapConfirm = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      setLoading(true);
      const [address] = await Location.reverseGeocodeAsync(coords);
      const city = address.city || address.subregion || address.district || '';
      const country = address.country || '';
      const geohash = getGeohash(coords.latitude, coords.longitude);

      setLocationState({
        ...coords,
        homeCity: city,
        country,
        geohash,
      });
      setFormData((prev) => ({ ...prev, homeCity: city, country }));
      setMapVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to resolve location.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!profilePhoto) {
      Alert.alert(
        'Photo Required',
        'Please upload a professional profile photo.',
      );
      return;
    }
    if (
      !formData.name ||
      !formData.primaryProfession ||
      !formData.phoneNumber ||
      !formData.homeCity
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in the required fields marked with *',
      );
      return;
    }

    if (
      !formData.phoneNumber.startsWith('+') ||
      (formData.whatsappNumber && !formData.whatsappNumber.startsWith('+'))
    ) {
      Alert.alert(
        'Invalid Format',
        'Please include your country code starting with + (e.g. +947xxxxxxxx)',
      );
      return;
    }

    setLoading(true);
    try {
      let photoUrl = profilePhoto;
      if (profilePhoto && !profilePhoto.startsWith('http')) {
        photoUrl = await uploadImage(
          profilePhoto,
          `profile_photos/${user.uid}/profile.jpg`,
        );
      }

      // Handle Work Samples
      const workSampleUrls = await Promise.all(
        formData.workSamples.map(async (uri, index) => {
          if (uri.startsWith('http')) return uri;
          return await uploadImage(
            uri,
            `work_samples/${user.uid}/sample_${index}_${Date.now()}.jpg`,
          );
        }),
      );

      const providerData: ServiceProvider = {
        id: user.uid,
        name: formData.name,
        title: formData.title,
        bio: formData.bio || '',
        about: formData.about || '',
        nic: formData.nic,
        primaryProfession: formData.primaryProfession,
        secondaryProfessions: formData.secondaryProfessions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        rating: stats.rating,
        reviewCount: stats.reviewCount,
        experienceYears: parseInt(formData.experienceYears) || 0,
        skillLevel: formData.skillLevel,
        languages: formData.languages.split(',').map((s) => s.trim()),
        location: {
          latitude: locationState?.latitude || 0,
          longitude: locationState?.longitude || 0,
          geohash: locationState?.geohash || '',
          homeCity: formData.homeCity,
          country: formData.country,
        },
        coverageArea: formData.coverageArea,
        serviceDistricts: formData.serviceDistricts,
        serviceCities: formData.serviceCities,
        travelWillingness: formData.travelWillingness,
        serviceRadius: formData.serviceRadius,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        contactMethod: formData.contactMethod,
        imageUrl: photoUrl,
        workSamples: workSampleUrls,
        availabilityStatus: 'online',
        emergencyAvailability: formData.emergencyAvailability,
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
        { merge: true },
      );

      await refreshUser();
      Alert.alert('Welcome!', 'Your provider profile is now active.', [
        { text: 'Great', onPress: () => router.replace('/(tabs)/profile') },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Optimization Failed',
        "We couldn't save your profile. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    label: string,
    isSelected: boolean,
    onSelect: () => void,
  ) => {
    const categoryInfo = CATEGORIES.find(
      (c) => c.slug.toLowerCase() === label.toLowerCase(),
    );
    const iconColor = categoryInfo ? categoryInfo.color : theme.accent;

    return (
      <TouchableOpacity
        key={label}
        onPress={onSelect}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? iconColor : theme.card,
            borderColor: isSelected ? iconColor : theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            height: 44,
            gap: 10,
          },
        ]}>
        {categoryInfo && (
          <MaterialCommunityIcons
            name={categoryInfo.icon as any}
            size={18}
            color={isSelected ? theme.onAccent : iconColor}
          />
        )}
        <ThemedText
          style={[
            styles.chipText,
            {
              color: isSelected ? theme.onAccent : theme.text,
              fontWeight: isSelected ? '600' : '500',
              textTransform: 'capitalize',
            },
          ]}>
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

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
            {userProfile?.isServiceProvider
              ? 'Update Profile'
              : 'Professional Profile'}
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
                style={[
                  styles.editBadge,
                  { backgroundColor: theme.accent, borderColor: theme.card },
                ]}>
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
                placeholder='+94 7x xxx xxxx'
                placeholderTextColor={theme.subtext}
              />
              <ThemedText style={styles.inputHint}>
                Include country code (e.g. +94 for Sri Lanka)
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>WhatsApp Number</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.whatsappNumber}
                onChangeText={(whatsappNumber) =>
                  setFormData({ ...formData, whatsappNumber })
                }
                keyboardType='phone-pad'
                placeholder='+94 7x xxx xxxx'
                placeholderTextColor={theme.subtext}
              />
              <ThemedText style={styles.inputHint}>
                If different from your phone number
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                <ThemedText style={styles.label}>Home City *</ThemedText>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={handleGetLocation}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: theme.accent + '15',
                      borderColor: theme.accent,
                      borderWidth: 1.5,
                      flex: 1,
                    },
                  ]}>
                  <Feather name='navigation' size={20} color={theme.accent} />
                  <ThemedText
                    style={{
                      color: theme.accent,
                      fontSize: 14,
                      fontWeight: '700',
                    }}>
                    Auto-Fill
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMapVisible(true)}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      borderWidth: 1.5,
                      flex: 1,
                    },
                  ]}>
                  <Feather name='map' size={20} color={theme.text} />
                  <ThemedText
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: '700',
                    }}>
                    Pick on Map
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
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setProfessionModalVisible(true)}>
                <ThemedText
                  style={{
                    color: formData.primaryProfession
                      ? theme.text
                      : theme.subtext,
                    fontSize: 15,
                    fontWeight: '500',
                  }}>
                  {formData.primaryProfession || 'Select your profession'}
                </ThemedText>
                <Feather
                  name='chevron-down'
                  size={20}
                  color={theme.subtext}
                  style={{ position: 'absolute', right: 16 }}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Secondary Professions (optional)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.secondaryProfessions}
                onChangeText={(secondaryProfessions) =>
                  setFormData({ ...formData, secondaryProfessions })
                }
                placeholder='e.g. Painter, Plumber (comma separated)'
                placeholderTextColor={theme.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Years of Experience</ThemedText>
              <View style={styles.chipGrid}>
                {EXPERIENCE_YEARS.map((year) =>
                  renderOption(year, formData.experienceYears === year, () =>
                    setFormData({ ...formData, experienceYears: year }),
                  ),
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Skill Level</ThemedText>
              <View style={styles.chipGrid}>
                {SKILL_LEVELS.map((level) =>
                  renderOption(level, formData.skillLevel === level, () =>
                    setFormData({ ...formData, skillLevel: level }),
                  ),
                )}
              </View>
            </View>
          </View>

          {/* Service Coverage Area */}
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
                <Feather name='map' size={18} color={theme.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>Service Area</ThemedText>
            </View>

            {locationState ? (
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Service Radius ({formData.serviceRadius} km)
                </ThemedText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 16,
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceRadius: Math.max(5, prev.serviceRadius - 5),
                      }))
                    }
                    style={[
                      styles.controlButton,
                      {
                        backgroundColor: theme.secondaryBackground,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Feather name='minus' size={24} color={theme.text} />
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      height: 12,
                      backgroundColor: theme.border,
                      borderRadius: 6,
                      marginHorizontal: 12,
                    }}>
                    <View
                      style={{
                        width: `${(formData.serviceRadius / 100) * 100}%`,
                        height: '100%',
                        backgroundColor: theme.accent,
                        borderRadius: 6,
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceRadius: Math.min(100, prev.serviceRadius + 5),
                      }))
                    }
                    style={[
                      styles.controlButton,
                      {
                        backgroundColor: theme.secondaryBackground,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Feather name='plus' size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    height: 200,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    region={{
                      latitude: locationState.latitude,
                      longitude: locationState.longitude,
                      latitudeDelta: (formData.serviceRadius / 111) * 2.5,
                      longitudeDelta: (formData.serviceRadius / 111) * 2.5,
                    }}>
                    <Circle
                      center={{
                        latitude: locationState.latitude,
                        longitude: locationState.longitude,
                      }}
                      radius={formData.serviceRadius * 1000}
                      fillColor={theme.accent + '30'}
                      strokeColor={theme.accent}
                      strokeWidth={2}
                    />
                    <Marker
                      coordinate={{
                        latitude: locationState.latitude,
                        longitude: locationState.longitude,
                      }}
                    />
                  </MapView>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.inputGroup,
                  { alignItems: 'center', padding: 20 },
                ]}>
                <Feather
                  name='map-pin'
                  size={32}
                  color={theme.subtext}
                  style={{ marginBottom: 12 }}
                />
                <ThemedText
                  style={{ color: theme.subtext, textAlign: 'center' }}>
                  Please select your Home City in the Identity section first to
                  set your service area.
                </ThemedText>
              </View>
            )}
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
                  {['Hourly', 'Fixed'].map((type) =>
                    renderOption(type, formData.pricingType === type, () =>
                      setFormData({
                        ...formData,
                        pricingType: type as any,
                      }),
                    ),
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

          {/* Work Samples Section */}
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
                <Feather name='image' size={18} color={theme.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>Work Samples</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Upload photos of your previous work (Max 5)
              </ThemedText>
              <View style={styles.mediaGrid}>
                {formData.workSamples.map((uri, index) => (
                  <View
                    key={`work-sample-${index}-${uri}`}
                    style={styles.mediaItem}>
                    <Image source={{ uri }} style={styles.mediaPreview} />
                    <TouchableOpacity
                      style={styles.removeMedia}
                      onPress={() => {
                        const newSamples = [...formData.workSamples];
                        newSamples.splice(index, 1);
                        setFormData({ ...formData, workSamples: newSamples });
                      }}>
                      <Feather name='x' size={12} color='white' />
                    </TouchableOpacity>
                  </View>
                ))}
                {formData.workSamples.length < 5 && (
                  <TouchableOpacity
                    style={[
                      styles.mediaItem,
                      styles.addMedia,
                      { borderColor: theme.border },
                    ]}
                    onPress={async () => {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ['images'],
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 0.6,
                      });
                      if (!result.canceled && result.assets[0].uri) {
                        setFormData({
                          ...formData,
                          workSamples: [
                            ...formData.workSamples,
                            result.assets[0].uri,
                          ],
                        });
                      }
                    }}>
                    <Feather name='plus' size={24} color={theme.subtext} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* About Section */}
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
              <ThemedText style={styles.sectionTitle}>About You</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Bio / Description</ThemedText>
              <TextInput
                style={[
                  styles.textarea,
                  {
                    color: theme.text,
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.about}
                onChangeText={(about) => setFormData({ ...formData, about })}
                multiline
                numberOfLines={4}
                placeholder='Tell potential customers about your skills and experience...'
                placeholderTextColor={theme.subtext}
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
                    {userProfile?.isServiceProvider
                      ? 'Save Changes'
                      : 'Become a Provider'}
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

        <MapPickerModal
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          onConfirm={handleMapConfirm}
          initialLocation={locationState}
          theme={theme}
        />

        <ProfessionPickerModal
          visible={professionModalVisible}
          onClose={() => setProfessionModalVisible(false)}
          onSelect={(profession, category) => {
            setFormData({
              ...formData,
              primaryProfession: profession,
              category: category,
            });
            setProfessionModalVisible(false);
          }}
          theme={theme}
          currentProfession={formData.primaryProfession}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function MapPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLocation,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
  initialLocation: { latitude: number; longitude: number } | null;
  theme: any;
}) {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 6.9271,
    longitude: initialLocation?.longitude || 79.8612,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <Modal visible={visible} animationType='slide' transparent={false}>
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View
            style={[
              styles.mapHeader,
              {
                backgroundColor: theme.card,
                borderBottomColor: theme.border,
              },
            ]}>
            <TouchableOpacity onPress={onClose} style={styles.mapCloseButton}>
              <Feather name='x' size={24} color={theme.text} />
            </TouchableOpacity>
            <ThemedText style={styles.mapTitle}>Pin your location</ThemedText>
            <TouchableOpacity
              onPress={() =>
                onConfirm({
                  latitude: region.latitude,
                  longitude: region.longitude,
                })
              }
              style={[
                styles.mapConfirmButton,
                {
                  backgroundColor: theme.accent,
                  height: 48,
                  justifyContent: 'center',
                  paddingHorizontal: 24,
                  borderRadius: 24,
                },
              ]}>
              <ThemedText
                style={{
                  fontWeight: '800',
                  fontSize: 16,
                  color: theme.onAccent,
                }}>
                Accept Location
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={region}
              onRegionChangeComplete={setRegion}
            />
            <View style={styles.mapMarkerFixed}>
              <Feather name='map-pin' size={40} color={theme.accent} />
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

function ProfessionPickerModal({
  visible,
  onClose,
  onSelect,
  theme,
  currentProfession,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (profession: string, category: string) => void;
  theme: any;
  currentProfession: string;
}) {
  const [customProfession, setCustomProfession] = useState('');
  const [search, setSearch] = useState('');

  // Show all workers but filter by search if present
  const workersToShow = WORKER_TYPES.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedWorker = WORKER_TYPES.find((w) => w.name === currentProfession);

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='formSheet'>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
        <ThemedView
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
            paddingBottom: 40,
          }}>
          <View
            style={[
              styles.mapHeader,
              {
                backgroundColor: theme.card,
                borderBottomColor: theme.border,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}>
            <ThemedText style={styles.mapTitle}>Choose Profession</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.mapCloseButton}>
              <Feather name='x' size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 14,
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  backgroundColor: theme.secondaryBackground,
                  borderColor: theme.border,
                  height: 48,
                  marginBottom: 10,
                },
              ]}>
              <Feather name='search' size={18} color={theme.subtext} />
              <TextInput
                style={{
                  flex: 1,
                  color: theme.text,
                  marginLeft: 10,
                  fontSize: 15,
                }}
                placeholder='Search professions...'
                placeholderTextColor={theme.subtext}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name='x-circle' size={18} color={theme.subtext} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 12 }}
            showsVerticalScrollIndicator={false}>
            {selectedWorker && search === '' && (
              <View style={{ marginTop: 10 }}>
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.accent,
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>
                  Selected
                </ThemedText>
                <View style={{ gap: 10 }}>
                  <ProfessionItem
                    worker={selectedWorker}
                    theme={theme}
                    onSelect={onSelect}
                    isSelected={true}
                  />
                </View>
              </View>
            )}

            {selectedWorker &&
              search === '' &&
              workersToShow.some((w) => w.name !== currentProfession) && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.border,
                    marginVertical: 10,
                  }}
                />
              )}

            <View style={{ marginTop: 10 }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: theme.subtext,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                All Professions
              </ThemedText>
              <View style={{ gap: 10 }}>
                {workersToShow
                  .filter((w) => w.name !== currentProfession)
                  .map((worker) => (
                    <ProfessionItem
                      key={worker.id}
                      worker={worker}
                      theme={theme}
                      onSelect={onSelect}
                    />
                  ))}
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

function ProfessionItem({
  worker,
  theme,
  onSelect,
  isSelected = false,
}: {
  worker: any;
  theme: any;
  onSelect: (profession: string, category: string) => void;
  isSelected?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(worker.name, worker.category)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        backgroundColor: isSelected
          ? theme.accent + '15'
          : theme.secondaryBackground,
        borderWidth: 2,
        borderColor: isSelected ? theme.accent : theme.border,
        gap: 20,
      }}>
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: worker.color + '25',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <MaterialCommunityIcons
          name={worker.icon as any}
          size={24}
          color={worker.color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: isSelected ? theme.accent : theme.text,
          }}>
          {worker.name}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 14,
            color: isSelected ? theme.accent : theme.subtext,
            textTransform: 'capitalize',
            marginTop: 4,
          }}>
          {worker.category}
        </ThemedText>
      </View>
      {isSelected ? (
        <Feather name='check-circle' size={24} color={theme.accent} />
      ) : (
        <Feather name='chevron-right' size={24} color={theme.subtext} />
      )}
    </TouchableOpacity>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 10,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    paddingHorizontal: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
  inputHint: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
    paddingLeft: 4,
  },
  input: {
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 16,
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
    width: '90%',
    marginHorizontal: 'auto',
    height: 60,
    borderRadius: 100,
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
    fontSize: 18,
    fontWeight: '800',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  mapCloseButton: {
    padding: 8,
  },
  mapConfirmButton: {
    backgroundColor: '#2E5BFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapMarkerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textarea: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  mediaItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  removeMedia: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMedia: {
    borderWidth: 2,
    height: '100%',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
