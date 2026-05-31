import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, type Theme } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/context/auth';
import { getStatusBarFallback } from '@/lib/safe-area';
import { LocationProvider } from '@/context/location';
import SplashScreenController from './splash';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialTopInset = getStatusBarFallback();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider
        initialSafeAreaInsets={{
          top: initialTopInset,
          bottom: 0,
          left: 0,
          right: 0,
        }}>
        <BottomSheetModalProvider>
          <AuthProvider>
            <LocationProvider>
              <ThemeProvider
                value={
                  colorScheme === 'dark' ? WorknetDarkTheme : WorknetLightTheme
                }>
                <SplashScreenController />
                <RootNavigator />
                <StatusBar style='auto' />
              </ThemeProvider>
            </LocationProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const WorknetLightTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.light.accent,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.notification,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

const WorknetDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.notification,
  },
  fonts: WorknetLightTheme.fonts,
};

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='(app)' options={{ headerShown: false }} />
      <Stack.Protected guard={!user}>
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen name='register' options={{ headerShown: false }} />
        <Stack.Screen name='forgot-password' options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name='modal'
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack.Protected>
    </Stack>
  );
}
