import { TabLayout } from '../../components/Tabs/TabLayout';
import { Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { View, Text } from 'react-native';

export default function ProtectedTabLayout() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { user, loading: userLoading } = useUser();

  if (userLoading || profileLoading) return <Text>Loading...</Text>;

  if (profileError) return <Text>Error loading profile: {profileError}</Text>;

  if (!user) return <Redirect href="/login" />;

  if (!profile) return <Redirect href="/welcome" />;

  if (profile.onboarding_completed === false) return <Redirect href="/welcome" />;

  return <TabLayout />;

  // uncomment to test onboarding
  // return <Redirect href="/welcome" />;
}