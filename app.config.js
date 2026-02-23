const config = {
  expo: {
    name: 'worknet',
    slug: 'worknet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'worknet',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    jsEngine: 'hermes',
    ios: {
      jsEngine: 'jsc',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/images/icon.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.orbitratech.worknet',
    },
    plugins: [
      'react-native-google-auth',
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
          imageWidth: 200,
          resizeMode: 'contain',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};

export default config;
