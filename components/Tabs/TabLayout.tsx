import { View, StyleSheet } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { usePendingRequests } from '@/context/PendingContext';
import { Icon } from '@/components/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Logo } from '@/components/Nav/Logo';
import Colors from '@/constants/Colors';

export function TabLayout() {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const indicator = usePendingRequests();

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
                {indicator && !pathname.includes('/profile') && (
                  <View style={styles.indicator} />
                )}
              </View>
            ),
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