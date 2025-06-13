import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { UserProvider } from '@/context/UserContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Asset } from 'expo-asset';

const imagesToCache = [
  require('../assets/images/fish-yellow.png'),
  require('../assets/images/fish-green.png'),
  require('../assets/images/fish-purple.png'),
  require('../assets/images/fish-red.png'),
  require('../assets/images/fish.png'),
  require('../assets/images/swim-background.png'),
  require('../assets/images/predator.png'),
  require('../assets/images/prey.png'),
  require('../assets/images/wave.png'),
];

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function cacheImages() {
      const cachePromises = imagesToCache.map(img => Asset.fromModule(img).downloadAsync());
      await Promise.all(cachePromises);
      setAssetsLoaded(true);
    }
    cacheImages();
  }, []);

  useEffect(() => {
    if (loaded && assetsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, assetsLoaded]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !assetsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
      <ProfileProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </ProfileProvider>
    </UserProvider>
  );
}
