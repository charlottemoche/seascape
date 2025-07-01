import { Redirect } from 'expo-router';
import { TabLayout } from '@/components/Tabs/TabLayout';
import { Loader } from '@/components/Loader';
import { useSession } from '@/context/SessionContext';
import { useOnboarding } from '@/context/OnboardingContext';

export default function HomeLayout() {
  const { user, loading: userLoading, sessionChecked, profile } = useSession();
  const { done } = useOnboarding();

  if (userLoading || !sessionChecked || done === null) {
    return <Loader />;
  }

  const hasOnboarded = user ? !!profile?.onboarding_completed : !!done;
  if (!hasOnboarded) return <Redirect href="/welcome" />;

  return <TabLayout />;
}