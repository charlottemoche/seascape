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
import { useRouter } from 'expo-router';
import { Asset } from 'expo-asset';
import { useRegisterPush } from '@/hooks/user/useRegisterPush';
import { PendingProvider, useSetPendingRequests } from '@/context/PendingContext';
import * as Linking from 'expo-linking/';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
  require('../assets/images/sun.png'),
  require('../assets/images/moon.png'),
  require('../assets/images/rain.png'),
  require('../assets/images/logo-light.png'),
  require('../assets/images/logo-dark.png'),
  require('../assets/images/splashscreen.png'),
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
      const cachePromises = imagesToCache.map(async (img) => {
        const asset = Asset.fromModule(img);
        try {
          await asset.downloadAsync();
          console.log('[asset] cached', asset.name, asset.localUri);
        } catch (err) {
          console.warn('[asset] failed', asset.name, err);
        }
      });

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
      <PendingProvider>
        <RootLayoutNav />
      </PendingProvider>
    </UserProvider>
  );
}

function useHandleRecovery() {
  const [handled, setHandled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url || handled) return;

      try {
        const parsed = new URL(url);

        const fragmentParams = new URLSearchParams(parsed.hash.slice(1));

        const access_token = fragmentParams.get('access_token');
        const refresh_token = fragmentParams.get('refresh_token');
        const type = fragmentParams.get('type');

        if (type === 'recovery' && access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

          if (error) {
            console.error('setSession failed:', error.message, error);
            Alert.alert('Error', 'Failed to set session: ' + error.message);
          } else {
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
  const router = useRouter();
  const setPending = useSetPendingRequests();

  useHandleRecovery();
  useRegisterPush();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const data = resp.notification.request.content.data;
      if (data?.type === 'friend_request') {
        setPending(true);
        router.push({ pathname: '/profile', params: { tab: 'requests' } });
      }
    });
    return () => sub.remove();
  }, []);

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
