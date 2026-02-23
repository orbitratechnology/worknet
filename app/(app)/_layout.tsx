import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='edit-profile'
        options={{
          title: 'Edit Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='enroll-provider'
        options={{
          title: 'Offer Your Service',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='public-profile'
        options={{
          title: 'Public Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='provider-profile'
        options={{
          title: 'My Provider Profile',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
