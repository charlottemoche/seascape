import { Redirect } from 'expo-router';
import { TabLayout } from '@/components/Tabs/TabLayout';
import { useSession } from '@/context/SessionContext';
import { useOnboarding } from '@/context/OnboardingContext';

export default function HomeLayout() {
  const { user, loading: userLoading, sessionChecked, profile } = useSession();
  const { done } = useOnboarding();

  const hasLoaded = !userLoading && sessionChecked && done !== null;

  if (!hasLoaded) return null;

  const hasOnboarded = user ? !!profile?.onboarding_completed : !!done;
  if (!hasOnboarded) return <Redirect href="/welcome" />;

  return <TabLayout />;
}