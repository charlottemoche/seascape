import React, { useEffect } from 'react';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon } from '@/components/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Logo } from '@/components/Nav/Logo';
import { listIncomingRequests } from '@/lib/friendService';
import Colors from '@/constants/Colors';

export function TabLayout() {
  const colorScheme = useColorScheme();
  const [indicator, setIndicator] = useState(false);

  useEffect(() => {
    async function checkRequests() {
      const requests = await listIncomingRequests();
      setIndicator(!!requests.length);
    }
    checkRequests();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Logo />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarStyle: {
            backgroundColor:
              colorScheme === 'dark' ? Colors.custom.dark : Colors.custom.lightBlue,
          },
          headerShown: false
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) =>
              Icon({ name: 'home', color, type: 'AntDesign' }),
          }}
        />
        <Tabs.Screen
          name="swim"
          options={{
            title: 'Play',
            tabBarIcon: ({ color }) =>
              Icon({ name: 'water-outline', color, type: 'Ionicons' }),
          }}
        />
        <Tabs.Screen
          name="breathe"
          options={{
            title: 'Breathe',
            tabBarIcon: ({ color }) =>
              Icon({ name: 'leaf-outline', color, type: 'Ionicons' }),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color }) =>
              Icon({ name: 'pencil', color, type: 'SimpleLineIcons' }),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <View style={{ position: 'relative' }}>
                {Icon({ name: 'user', color, type: 'AntDesign' })}
                {indicator && (
                  <View
                    style={styles.indicator}
                  />
                )}
              </View>
            ),
          }}
          listeners={{
            tabPress: () => setIndicator(false),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
  },
});