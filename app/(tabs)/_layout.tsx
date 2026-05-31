import React from 'react';

import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name='index'>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='house.fill' md='home' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='services'>
        <NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='magnifyingglass' md='search' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='map'>
        <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='map.fill' md='map' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='offer-service'>
        <NativeTabs.Trigger.Label>Offer</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='briefcase.fill' md='work' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='profile'>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='person.fill' md='person' />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//         tabBarStyle: {
//           position: 'absolute',
//           elevation: 5,
//           backgroundColor: Colors[colorScheme ?? 'light'].background,
//           height: 65,
//           borderTopWidth: 0,
//         },
//         tabBarItemStyle: {
//           paddingVertical: 5,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '500',
//         },
//       }}>
//       <Tabs.Screen
//         name='index'
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => (
//             <Feather size={24} name='home' color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name='services'
//         options={{
//           title: 'Services',
//           tabBarIcon: ({ color }) => (
//             <Feather size={24} name='search' color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name='map'
//         options={{
//           title: 'Map',
//           tabBarIcon: ({ color }) => (
//             <Feather size={24} name='map' color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name='profile'
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => (
//             <Feather size={24} name='user' color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
