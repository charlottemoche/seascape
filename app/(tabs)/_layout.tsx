import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { TabLayout } from '@/components/Tabs/TabLayout';
import { useSession } from '@/context/SessionContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Loader } from '@/components/Loader';
import * as SplashScreen from 'expo-splash-screen';

export default function HomeLayout() {
  const { user, loading: userLoading, sessionChecked, profile } = useSession();
  const { done } = useOnboarding();

  const hasLoaded = !userLoading && sessionChecked && done !== null;

  useEffect(() => {
    if (hasLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hasLoaded]);

  if (!hasLoaded) {
    return <Loader />;
  }

  const hasOnboarded = user ? !!profile?.onboarding_completed : !!done;
  if (!hasOnboarded) return <Redirect href="/welcome" />;

  return <TabLayout />;
}