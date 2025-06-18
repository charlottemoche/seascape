import {
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  View,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { supabase } from '@/lib/supabase';
import { FishCustomizer } from '@/components/FishCustomizer';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import preyImg from '@/assets/images/prey.png';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useRequireAuth();
  const { setUser } = useUser();
  const { profile } = useProfile();

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? Colors.custom.dark : '#f8f8f8';

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err) {
              console.error('Unexpected error deleting account:', err);
              Alert.alert('Error', 'Something went wrong.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteAccount = async () => {
    if (!user) return;

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch('https://kycsdqkgoqroyxdytgil.supabase.co/functions/v1/delete-user', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let result;
    const text = await res.text();
    try {
      result = JSON.parse(text);
    } catch {
      console.error('Non-JSON response:', text);
      Alert.alert('Error', 'Unexpected server response.');
      return;
    }

    if (!res.ok) {
      console.error('Account deletion failed:', result?.error);
      Alert.alert('Error', result?.error || 'Something went wrong.');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    router.replace('/login?deleted=true');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error && error.name !== 'AuthSessionMissingError') {
        console.error('Logout error:', error);
        Alert.alert('Error', 'Failed to log out. Please try again.');
        return;
      }

      setUser(null);
      Alert.alert('Success', 'You have been logged out.');
    } catch (err) {
      console.warn('Forcing logout due to unexpected error:', err);
      setUser(null);
    }
  };

  const highScore = profile?.high_score ?? 0;

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.wrapper, { backgroundColor: backgroundColor }]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.wrapper}>
            <View style={styles.loggedInWrapper}>
              <Text>
                Logged in as: {user?.email ?? 'No email'}
              </Text>
              <View style={styles.highScoreWrapper}>
                <Text>
                  High Score: {highScore}
                </Text>
                <Image
                  source={preyImg}
                  style={styles.fishImage}
                />
              </View>
            </View>

            <FishCustomizer />

            <View style={styles.logoutWrapper}>
              <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
              <Pressable onPress={handleDeleteAccount} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete account</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loggedInWrapper: {
    paddingTop: 24,
    alignItems: 'center',
  },
  logoutWrapper: {
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  },
  logoutButton: {
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    borderColor: '#aaa',
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 6,
  },
  deleteButton: {
    borderRadius: 8,
    borderColor: 'red',
    borderWidth: 0.5,
  },
  deleteText: {
    fontSize: 16,
    padding: 6,
    color: 'red',
  },
  highScoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fishImage: {
    width: 24,
    height: 24,
    marginLeft: 4,
  },
});