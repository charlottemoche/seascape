import React from 'react';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>
            TabBarIcon({ name: 'home', color, type: 'AntDesign' }),
        }}
      />
      <Tabs.Screen
        name="swim"
        options={{
          title: 'Swim',
          tabBarIcon: ({ color }) =>
            TabBarIcon({ name: 'water-outline', color, type: 'Ionicons' }),
        }}
      />
      <Tabs.Screen
        name="breathe"
        options={{
          title: 'Breathe',
          tabBarIcon: ({ color }) =>
            TabBarIcon({ name: 'leaf-outline', color, type: 'Ionicons' }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) =>
            TabBarIcon({ name: 'user', color, type: 'AntDesign' }),
        }}
      />
    </Tabs>
  );
}