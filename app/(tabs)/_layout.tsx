import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          elevation: 5,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          height: 65,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather size={24} name='home' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='services'
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => (
            <Feather size={24} name='search' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <Feather size={24} name='map' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather size={24} name='user' color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
