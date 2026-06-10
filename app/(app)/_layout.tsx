import { useAuth } from '@/context/auth';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function AppLayout() {
  const { user } = useAuth();

  return (
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
  );
}
