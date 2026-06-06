import { useAuth } from '@/context/auth';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';

const PROTECTED_APP_ROUTES = new Set([
  'settings',
  'edit-profile',
  'saved-workers',
  'provider-profile',
  'enroll-provider',
  'become-worker',
]);

function AuthStackRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || user) return;
    const appRoute = segments[1];
    if (
      segments[0] === '(app)' &&
      typeof appRoute === 'string' &&
      PROTECTED_APP_ROUTES.has(appRoute)
    ) {
      router.replace('/(tabs)/profile');
    }
  }, [user, loading, segments, router]);

  return null;
}

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <>
      <AuthStackRedirect />
      <Stack>
      <Stack.Screen
        name='public-profile'
        options={{ title: 'Public Profile', headerShown: false }}
      />
      <Stack.Screen
        name='provider-reviews'
        options={{ title: 'Reviews', headerShown: false }}
      />
      <Stack.Screen
        name='explore'
        options={{ title: 'Explore Problems', headerShown: false }}
      />
      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name='become-worker'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='edit-profile'
          options={{ title: 'Edit Profile', headerShown: false }}
        />
        <Stack.Screen
          name='enroll-provider'
          options={{ title: 'Become a Worker', headerShown: false }}
        />
        <Stack.Screen
          name='provider-profile'
          options={{ title: 'Worker Profile', headerShown: false }}
        />
        <Stack.Screen
          name='settings'
          options={{ title: 'Settings', headerShown: false }}
        />
        <Stack.Screen
          name='saved-workers'
          options={{ title: 'Saved Workers', headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
    </>
  );
}
