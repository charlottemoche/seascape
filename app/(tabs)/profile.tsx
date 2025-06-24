import {
  Pressable,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  View,
  Linking,
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

  const backgroundColor = colorScheme === 'dark' ? Colors.custom.dark : '#fff';
  const footerColor = colorScheme === 'dark' ? Colors.custom.dark : '#f8f8f8';
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const linkColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.darkBlue;

  const highScore = profile?.high_score ?? 0;

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
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      Alert.alert('Error', 'Unexpected server response.');
      return;
    }

    if (!res.ok) {
      Alert.alert('Error', result?.error || 'Something went wrong.');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    router.replace('/login?deleted=true');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.name !== 'AuthSessionMissingError') {
        Alert.alert('Error', 'Failed to log out. Please try again.');
        return;
      }
      setUser(null);
      Alert.alert('Success', 'You have been logged out.');
    } catch {
      setUser(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: footerColor }]}>
      <ScrollView style={{ backgroundColor: footerColor }}>
        <View style={{ padding: 24, backgroundColor: backgroundColor }}>
          <View style={styles.profileSection}>
            <Text style={[styles.label, { color: textColor }]}>Email</Text>
            <Text style={[styles.value, { color: textColor }]}>{user?.email ?? 'No email'}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={[styles.label, { color: textColor }]}>High Score</Text>
            <View style={styles.highScoreRow}>
              <Text style={[styles.value, { color: textColor }]}>{highScore}</Text>
              <Image source={preyImg} style={styles.fishImage} />
            </View>
          </View>

          <View style={styles.customizerWrapper}>
            <FishCustomizer />
          </View>

          <View style={styles.logoutWrapper}>
            <Pressable onPress={handleLogout} style={[styles.button, { borderColor: '#aaa' }]}>
              <Text style={styles.buttonText}>Log out</Text>
            </Pressable>
            <Pressable onPress={handleDeleteAccount} style={[styles.button, { borderColor: 'red' }]}>
              <Text style={[styles.buttonText, { color: 'red' }]}>Delete account</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ backgroundColor: footerColor }}>
          <View style={[styles.footer, { backgroundColor: footerColor }]}>
            <Pressable onPress={() => Linking.openURL('https://seascapeapp.com')}>
              <Text style={[styles.footerLink, { color: linkColor }]}>Privacy Policy</Text>
            </Pressable>
            <Text style={[styles.footerText, { color: textColor }]}>Version 1.3.4</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fishImage: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  customizerWrapper: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 14,
  },
  logoutWrapper: {
    paddingTop: 12,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
  },
});