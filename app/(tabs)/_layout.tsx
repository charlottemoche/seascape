import { TabLayout } from '../../components/Tabs/TabLayout';
import { Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';

export default function ProtectedTabLayout() {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return <TabLayout />;
}