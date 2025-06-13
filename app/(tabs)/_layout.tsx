import { TabLayout } from '../../components/Tabs/TabLayout';
import { Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { View, Text } from 'react-native';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export default function ProtectedTabLayout() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { user, loading: userLoading } = useUser();

  if (userLoading || profileLoading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.custom.lightBlue} />
      </View>
    );

  if (profileError)
    return (
      <View style={styles.container}>
        <Text>We're having trouble loading your profile.</Text>
      </View>
    );

  if (!user) return <Redirect href="/login" />;

  if (!profile) return <Redirect href="/welcome" />;

  if (profile.onboarding_completed === false) return <Redirect href="/welcome" />;

  return <TabLayout />;

  // uncomment to test onboarding
  // return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});