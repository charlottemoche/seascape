import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { FishCustomizer } from '@/components/FishCustomizer';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
      return;
    }
    setUser(null);
    router.replace('/login');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.loggedInWrapper}>
        <Text style={styles.loggedInText}>
          Logged in as: {user?.email ?? 'No email'}
        </Text>
      </View>
  
      <FishCustomizer />

      <View style={styles.logoutWrapper}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loggedInWrapper: {
    backgroundColor: Colors.custom.background,
    paddingTop: 24,
    alignItems: 'center',
  },
  loggedInText: {
    color: Colors.custom.lightBlue,
  },
  logoutWrapper: {
    backgroundColor: Colors.custom.background,
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: '#aaa',
    fontSize: 16,
    borderColor: '#aaa',
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 6,
  },
});