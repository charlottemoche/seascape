import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { supabase } from '@/lib/supabase';
import { FishCustomizer } from '@/components/FishCustomizer';
import preyImg from '@/assets/images/prey.png';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const { user } = useRequireAuth();
  const { setUser } = useUser();
  const { profile } = useProfile();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
      return;
    }
    setUser(null);
  };

  const highScore = profile?.high_score ?? 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.wrapper}>
        <View style={styles.loggedInWrapper}>
          <Text style={styles.profileText}>
            Logged in as: {user?.email ?? 'No email'}
          </Text>
          <View style={styles.highScoreWrapper}>
            <Text style={styles.profileText}>
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
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  profileText: {
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