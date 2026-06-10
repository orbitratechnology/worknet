import { Stack } from 'expo-router';

export default function BecomeWorkerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='identity' />
      <Stack.Screen name='verification' />
      <Stack.Screen name='profession' />
      <Stack.Screen name='location' />
      <Stack.Screen name='details' />
      <Stack.Screen name='review' />
    </Stack>
  );
}
