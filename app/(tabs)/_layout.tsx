import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { TabLayout } from '@/components/Tabs/TabLayout';
import { Loader } from '@/components/Loader';
import { useSession } from '@/context/SessionContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useStreaks } from '@/context/StreakContext';

export default function HomeLayout() {
  const { user, loading: userLoading, sessionChecked, profile } = useSession();
  const { done } = useOnboarding();
  const { streaksLoading, refreshStreaks } = useStreaks();

  useEffect(() => {
    if (user && !streaksLoading) return;
    if (user) refreshStreaks();
  }, [user, streaksLoading, refreshStreaks]);

  if (userLoading || !sessionChecked || streaksLoading || done === null) {
    return <Loader />;
  }

  const hasOnboarded = user ? !!profile?.onboarding_completed : !!done;
  if (!hasOnboarded) return <Redirect href="/welcome" />;

  return <TabLayout />;
}