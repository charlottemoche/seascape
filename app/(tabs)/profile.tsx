import React, { useState, useEffect } from 'react';
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
import { Icon } from '@/components/Icon';
import { listIncomingRequests } from '@/lib/friendService';
import Colors from '@/constants/Colors';
import preyImg from '@/assets/images/prey.png';
import AddByCode from '@/components/Friends/AddFriend';
import IncomingRequests from '@/components/Friends/IncomingRequests';
import FriendsList from '@/components/Friends/Friends';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useRequireAuth();
  const { setUser } = useUser();
  const { profile } = useProfile();

  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'profile' | 'friends'>('profile');
  const [friendRefreshTick, setFriendRefreshTick] = useState(0);
  const [friendSubTab, setFriendSubTab] = useState<'list' | 'requests' | 'add'>('list');
  const [hasPending, setHasPending] = useState(false);
  const [tapped, setTapped] = useState(false)

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const selectedTextColor = colorScheme === 'dark' ? '#fff' : '#000';
  const linkColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.darkBlue;
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const selectedTab = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.white;
  const unselectedTab = colorScheme === 'dark' ? Colors.dark.background : Colors.custom.transparent;

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

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const incoming = await listIncomingRequests();
        if (!cancelled) setHasPending(incoming.length > 0);
      } catch { /* ignore */ }
    }
    refresh();
    return () => { cancelled = true; };
  }, [friendRefreshTick]);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.tabBar,
            { borderColor: greyBorder, backgroundColor: Colors.custom.grey, marginTop: 24 },
          ]}
        >
          {(['profile', 'friends'] as const).map((key) => (
            <Pressable
              key={key}
              onPress={() => { setTab(key); setTapped(true); }}
              style={[
                styles.tab,
                { borderColor: greyBorder },
                tab === key ? { backgroundColor: selectedTab } : { backgroundColor: unselectedTab },
              ]}
            >

              <View style={styles.tabs}>
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === key ? selectedTextColor : textColor },
                  ]}
                >
                  {key === 'profile' ? 'Profile' : 'Friends'}
                </Text>

                {hasPending && !tapped && key === 'friends' && <View style={styles.indicator} />}
              </View>

            </Pressable>
          ))}
        </View>

        <View style={styles.container}>
          {tab === 'profile' && (
            <>
              <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                <View style={styles.textRow}>
                  <Text style={[styles.label, { borderBottomColor: greyBorder, color: textColor }]}>Email</Text>
                  <Text style={[styles.value, { color: textColor }]}>{user?.email ?? 'No email'}</Text>
                </View>

                <View style={styles.textRow}>
                  <Text style={[styles.label, { borderBottomColor: greyBorder, color: textColor, paddingTop: 20 }]}>
                    Friend Code
                  </Text>

                  <Pressable onPress={copyCode} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.value, { color: textColor }]}>
                      {code}
                    </Text>
                    <Icon
                      type="Ionicons"
                      name="copy-outline"
                      color='#808080'
                      size={16}
                      style={{ marginLeft: 4 }}
                    />
                  </Pressable>
                </View>

                <Text style={[styles.label, { borderBottomColor: greyBorder, color: textColor, paddingTop: 20 }]}>High Score</Text>
                <View style={styles.highScoreRow}>
                  <Text style={[styles.value, { color: textColor }]}>{highScore}</Text>
                  <Image source={preyImg} style={styles.fishImage} />
                </View>
              </View>

              <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                <FishCustomizer />
              </View>

              <View style={styles.logoutWrapper}>
                <Button title="Log out" onPress={handleLogout} variant="tertiary" />
                <Button title="Delete account" onPress={handleDeleteAccount} variant="danger" />
              </View>
            </>
          )}
          {tab === 'friends' && (
            <View>
              <View
                style={[
                  styles.tabBar, styles.tabBarFriends,
                  { borderColor: greyBorder, marginBottom: 30, }
                ]}
              >
                {(['add', 'requests', 'list'] as const).map((key, idx, arr) => (
                  <Pressable
                    key={key}
                    onPress={() => { setFriendSubTab(key); setTapped(true); }}
                    style={[
                      styles.tab,
                      { borderColor: greyBorder },

                      friendSubTab === key && styles.tabActiveFriends,

                      idx !== arr.length - 1 && {
                        borderRightWidth: 1,
                        borderRightColor: greyBorder,
                      },
                    ]}
                  >
                    <View style={styles.tabs}>
                      <Text
                        style={[
                          styles.tabText,
                          { color: friendSubTab === key ? '#000' : textColor },
                        ]}
                      >
                        {key === 'add' ? 'Add'
                          : key === 'requests' ? 'Requests'
                            : 'Friends'}
                      </Text>

                      {hasPending && key === 'requests' && (
                        <View style={styles.indicator} />
                      )}
                    </View>
                  </Pressable>
                ))}

              </View>

              {friendSubTab === 'list' && (
                <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                  <Text style={[styles.sectionTitle, { borderBottomWidth: 1, borderBottomColor: greyBorder, paddingBottom: 12 }]}>
                    Friends
                  </Text>
                  <FriendsList refreshSignal={friendRefreshTick} />
                </View>
              )}

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
            </View>
          )}
        </View>
      </ScrollView>
      <View style={{ backgroundColor: cardColor, maxHeight: 50 }}>
        <View style={[styles.footer, { backgroundColor: cardColor, borderColor: greyBorder }]}>
          <Pressable onPress={() => Linking.openURL('https://seascapeapp.com')}>
            <Text style={[styles.footerLink, { color: linkColor }]}>Privacy Policy</Text>
          </Pressable>
          <Text style={[styles.footerText, { color: textColor }]}>Version 1.5.8</Text>
        </View>
      </View>
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
  scrollView: {
    flex: 1,
    paddingBottom: 24,
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
    fontSize: 14,
    marginTop: 2,
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 8,
    fontWeight: 500,
    alignSelf: 'flex-start',
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
    minHeight: 50,
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
    fontWeight: 600,
  },
  tabs: {
    position: 'relative',
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  indicator: {
    position: 'absolute',
    top: '20%',
    right: -10,
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
  },
});