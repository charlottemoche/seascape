import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { UserProvider } from '@/context/UserContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { StreakProvider } from '@/context/StreakContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking/';
import { useRouter } from 'expo-router';
import { Asset } from 'expo-asset';
import 'react-native-reanimated';

const imagesToCache = [
  require('../assets/images/fish-yellow.png'),
  require('../assets/images/fish-green.png'),
  require('../assets/images/fish-purple.png'),
  require('../assets/images/fish-red.png'),
  require('../assets/images/fish.png'),
  require('../assets/images/swim-background.png'),
  require('../assets/images/coral-reef.png'),
  require('../assets/images/kelp-forest.png'),
  require('../assets/images/predator.png'),
  require('../assets/images/prey.png'),
  require('../assets/images/wave.png'),
  require('../assets/images/sun-2.png'),
  require('../assets/images/moon-2.png'),
  require('../assets/images/rain-2.png'),
];

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded || !assetsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}

function useHandleRecovery() {
  const router = useRouter();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      console.log('Handling URL:', url);  // Log incoming URL

      if (!url || handled) return;

      try {
        const parsed = new URL(url);
        console.log('Parsed URL:', parsed);

        const fragmentParams = new URLSearchParams(parsed.hash.slice(1));
        console.log('Fragment params:', Object.fromEntries(fragmentParams.entries()));

        const access_token = fragmentParams.get('access_token');
        const refresh_token = fragmentParams.get('refresh_token');
        const type = fragmentParams.get('type');

        console.log('Extracted tokens:', { access_token, refresh_token, type });

        if (type === 'recovery' && access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

          if (error) {
            console.error('setSession failed:', error.message, error);
            Alert.alert('Error', 'Failed to set session: ' + error.message);
          } else {
            console.log('Session set successfully:', data);
            setHandled(true);
            router.replace('/password');
          }
        } else if (type === 'recovery') {
          console.warn('Incomplete recovery params', { type, access_token, refresh_token });
        }
      } catch (err) {
        console.error('Error parsing URL:', err);
        Alert.alert('Error', 'Failed to parse recovery URL.');
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const sub = Linking.addEventListener('url', (event: { url: string | null }) => {
      handleUrl(event.url);
    });

    return () => sub.remove();
  }, [handled]);
}

function RootLayoutNav() {
  useHandleRecovery();

  const colorScheme = useColorScheme();

  return (
    <ProfileProvider>
      <StreakProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </StreakProvider>
    </ProfileProvider>
  );
}
