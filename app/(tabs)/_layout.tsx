import { TabLayout } from '../../components/Tabs/TabLayout';
import { Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { View, Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';

export default function ProtectedTabLayout() {
  const { user, loading: userLoading, sessionChecked } = useUser();
  const { profile, error: profileError } = useProfile();

  const shouldRedirectToLogin = sessionChecked && !user;
  const hasProfileError = !!profileError;
  const shouldRedirectToWelcome = profile && profile.onboarding_completed === false;

  // if (!sessionChecked || userLoading) {
  //   return <Loader />;
  // }

  // if (shouldRedirectToLogin) {
  //   return <Redirect href="/login" />;
  // }

  // if (hasProfileError) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>We're having trouble loading your profile.</Text>
  //     </View>
  //   );
  // }

  // if (shouldRedirectToWelcome) {
  //   return <Redirect href="/welcome" />;
  // }

  // return <TabLayout />;
    return <Redirect href="/password" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.transparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});