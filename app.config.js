export default ({ config }) => ({
  ...config,
  name: 'Worknet',
  slug: 'worknet',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'worknet',
  userInterfaceStyle: 'automatic',
  buildCacheProvider: 'eas',
  jsEngine: 'hermes',
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.orbitra.worknet',
    usesAppleSignIn: true,
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDisplayName: 'Worknet',
    },
  },
  android: {
    ...config.android,
    package: 'com.orbitra.worknet',
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#ffffff',
      foregroundImage: './assets/images/icon.png',
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    'expo-apple-authentication',
    'react-native-google-auth',
    'expo-font',
    'expo-image',
    'expo-web-browser',
    'expo-secure-store',
    'expo-router',
    '@rnrepo/expo-config-plugin',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow Worknet to use your location to find the best local services nearby.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Worknet to access your photos to upload a profile picture.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission:
          'Allow Worknet to save work sample images to your photo library.',
        savePhotosPermission:
          'Allow Worknet to save work sample images to your photo library.',
        isAccessMediaLocationEnabled: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/adaptive-icon.png',
        imageWidth: 100,
        resizeMode: 'contain',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    eas: {
      projectId: '05f25758-d9a3-4897-9f54-327c31f0c7dc',
    },
  },
});
