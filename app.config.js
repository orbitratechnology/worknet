export default ({ config }) => ({
  ...config,
  name: 'worknet',
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
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    ...config.android,
    package: 'com.orbitra.worknet',
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
    'react-native-google-auth',
    'expo-font',
    'expo-image',
    'expo-web-browser',
    'expo-secure-store',
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysPermission:
          'Allow Worknet to use your location even when the app is in background to find the best local services for you.',
        locationWhenInUsePermission:
          'Allow Worknet to use your location to find the best local services nearby.',
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Worknet to access your photos to upload a profile picture.',
        cameraPermission:
          'Allow Worknet to access your camera to take a profile picture.',
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
    // reactCompiler: true,
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
