import React, { useEffect } from 'react';
import { useState } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { Icon } from '@/components/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Logo } from '@/components/Nav/Logo';
import { useUser } from '@/context/UserContext';
import { listenForIncomingRequests, listIncomingRequests } from '@/lib/friendService';
import Colors from '@/constants/Colors';

export function TabLayout() {
  const pathname = usePathname();
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const [indicator, setIndicator] = useState(false);

  useEffect(() => {
    if (!user) return;
    const stop = listenForIncomingRequests(user.id, () => {
      if (!pathname.includes('/profile')) {
        setIndicator(true);
      }
    });
    return stop;
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const refetch = async () => {
      const req = await listIncomingRequests();
      setIndicator(req.length > 0);
    };

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refetch();
    });

    refetch();

    return () => {
      sub.remove();
    };
  }, [user?.id]);

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