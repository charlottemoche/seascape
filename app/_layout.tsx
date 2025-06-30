import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SessionProvider } from '@/context/SessionContext';
import { StreakProvider } from '@/context/StreakContext';
import { NudgeProvider } from '@/context/NudgeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { Asset } from 'expo-asset';
import { useRegisterPush } from '@/hooks/user/useRegisterPush';
import { PendingProvider } from '@/context/PendingContext';
import { useNotificationNavigation } from '@/hooks/useNotificationNavigation';
import { useAuthRedirect } from '@/hooks/user/useAuthRedirect';
import { useHandleRecovery } from '@/hooks/useHandleRecovery';
import { useAuthReady } from '@/hooks/user/useAuthReady';
import NudgeModal from '@/components/Modals/NudgeModal';
import * as SplashScreen from 'expo-splash-screen';
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

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const tasks = imagesToCache.map((img) =>
        Asset.fromModule(img).downloadAsync()
      );
      await Promise.all(tasks);
      setAssetsLoaded(true);
    })();
  }, []);

  if (fontError) throw fontError;
  if (!fontsLoaded || !assetsLoaded) return null;

  return (
    <SessionProvider>
      <OnboardingProvider>
      <PendingProvider>
        <NudgeProvider>
          <AuthGate />
        </NudgeProvider>
      </PendingProvider>
      </OnboardingProvider>
    </SessionProvider>
  );
}

function AuthGate() {
  const authReady = useAuthReady();
  const { done }  = useOnboarding();

  useEffect(() => {
    if (authReady && done !== null) {
      SplashScreen.hideAsync();
    }
  }, [authReady, done]);

  if (!authReady || done === null) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useHandleRecovery();
  useRegisterPush();
  useAuthRedirect();
  useNotificationNavigation();

  const ready = useAuthReady();
  const colorScheme = useColorScheme();
  if (!ready) return null;

  return (
    <StreakProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <NudgeModal />
      </ThemeProvider>
    </StreakProvider>
  );
}