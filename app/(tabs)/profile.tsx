import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { supabase } from '@/lib/supabase';
import { FishCustomizer } from '@/components/FishCustomizer';
import { Text, Button, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import preyImg from '@/assets/images/prey.png';
import * as Clipboard from 'expo-clipboard';
import AddByCode from '@/components/Friends/AddFriend';
import IncomingRequests from '@/components/Friends/IncomingRequests';
import FriendsList from '@/components/Friends/Friends';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useRequireAuth();
  const { setUser } = useUser();
  const { profile } = useProfile();

  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'profile' | 'friends'>('profile');
  const [friendRefreshTick, setFriendRefreshTick] = useState(0);
  const [friendSubTab, setFriendSubTab] = useState<'add' | 'requests' | 'list'>('add');

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  const footerColor = colorScheme === 'dark' ? Colors.dark.background : '#f8f8f8';
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const linkColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.darkBlue;
  const greyBorder = colorScheme === 'dark' ? '#292828' : Colors.custom.grey;

  const highScore = profile?.high_score ?? 0;

  const code = profile?.friend_code ?? '';

  async function copyCode() {
    if (!code || busy) return;
    setBusy(true);
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', 'Friend code copied to clipboard.');
    setBusy(false);
  }

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
      router.replace('/login?logout=true');
      setUser(null);
    } catch {
      setUser(null);
    }
  };

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: backgroundColor }]}>
      <ScrollView>
        <View
          style={[
            styles.tabBar,
            { borderColor: greyBorder, backgroundColor: backgroundColor, marginTop: 24 },
          ]}
        >
          {(['profile', 'friends'] as const).map((key) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[
                styles.tab,
                { borderColor: greyBorder },
                tab === key && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === key ? '#000' : textColor },
                ]}
              >
                {key === 'profile' ? 'Profile' : 'Friends'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.container}>
          {tab === 'profile' && (
            <>
              <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                <View style={styles.textRow}>
                  <Text style={[styles.label, { color: textColor }]}>Email</Text>
                  <Text style={[styles.value, { color: textColor }]}>{user?.email ?? 'No email'}</Text>
                </View>

                <View style={styles.textRow}>
                  <Text style={[styles.label, { color: textColor, paddingTop: 20 }]}>
                    Friend Code
                  </Text>

                  <Pressable onPress={copyCode}>
                    <Text style={[styles.value, { color: textColor, textDecorationLine: 'underline' }]}>
                      {code}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.label, { color: textColor, paddingTop: 20 }]}>High Score</Text>
                <View style={styles.highScoreRow}>
                  <Text style={[styles.value, { color: textColor }]}>{highScore}</Text>
                  <Image source={preyImg} style={styles.fishImage} />
                </View>
              </View>

              <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                <FishCustomizer />
              </View>

              <View style={styles.logoutWrapper}>
                <Button title="Log out" onPress={handleLogout} variant="secondary" />
                <Button title="Delete account" onPress={handleDeleteAccount} variant="danger" />
              </View>
            </>
          )}
          {tab === 'friends' && (
            <>
              <View
                style={[
                  styles.tabBar, styles.tabBarFriends,
                  { borderColor: greyBorder, marginBottom: 20, }
                ]}
              >
                {(['add', 'requests', 'list'] as const).map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => setFriendSubTab(key)}
                    style={[
                      styles.tab,
                      { borderColor: greyBorder },
                      friendSubTab === key && styles.tabActiveFriends,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { color: friendSubTab === key ? '#000' : textColor },
                      ]}
                    >
                      {key === 'add'
                        ? 'Add'
                        : key === 'requests'
                          ? 'Requests'
                          : 'Friends'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {friendSubTab === 'add' && (
                <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                  <Text style={styles.sectionTitle}>Add Friend</Text>
                  <AddByCode />
                </View>
              )}

              {friendSubTab === 'requests' && (
                <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                  <Text style={[styles.sectionTitle, { borderBottomWidth: 1, borderBottomColor: greyBorder, paddingBottom: 12 }]}>
                    Incoming Requests
                  </Text>
                  <IncomingRequests
                    onAccepted={() => {
                      setFriendRefreshTick((n) => n + 1);
                      setFriendSubTab('list');
                    }}
                  />
                </View>
              )}

              {friendSubTab === 'list' && (
                <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                  <Text style={[styles.sectionTitle, { borderBottomWidth: 1, borderBottomColor: greyBorder, paddingBottom: 12 }]}>
                    Friends
                  </Text>
                  <FriendsList refreshSignal={friendRefreshTick} />
                </View>
              )}
            </>
          )}
        </View>

        <View style={{ backgroundColor: footerColor }}>
          <View style={[styles.footer, { backgroundColor: footerColor, borderColor: greyBorder }]}>
            <Pressable onPress={() => Linking.openURL('https://seascapeapp.com')}>
              <Text style={[styles.footerLink, { color: linkColor }]}>Privacy Policy</Text>
            </Pressable>
            <Text style={[styles.footerText, { color: textColor }]}>Version 1.5.7</Text>
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
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  profileSection: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 30,
    maxWidth: 500,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 182, 212, 0.4)',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 8,
  },
  value: {
    fontSize: 16,
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textRow: {
    backgroundColor: 'transparent',
  },
  fishImage: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
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
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: '60%',
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tabBarFriends: {
    backgroundColor: 'rgba(207, 233, 241, 0.1)',
  },
  tabActiveFriends: {
    backgroundColor: 'rgba(207, 233, 241, 0.6)',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 24,
  },
  tabActive: {
    backgroundColor: Colors.custom.grey,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
});