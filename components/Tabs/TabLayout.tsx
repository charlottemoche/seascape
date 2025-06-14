import React from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Logo } from '@/components/Nav/Logo';

export function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Logo />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false
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
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color }) =>
              TabBarIcon({ name: 'pencil', color, type: 'SimpleLineIcons' }),
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
    </View>
  );
}