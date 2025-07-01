import React, { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Linking,
  Image,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { FadeImage } from '@/components/FadeImage';
import { FishCustomizer } from '@/components/Fish/FishCustomizer';
import { useSession } from '@/context/SessionContext';
import { Text, Button, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/Icon';
import { usePendingRequests, useSetPendingRequests } from '@/context/PendingContext';
import { registerForPushAsync } from '@/lib/pushService';
import { Loader } from '@/components/Loader';
import Colors from '@/constants/Colors';
import preyImg from '@/assets/images/prey.png';
import AddByCode from '@/components/Friends/AddFriend';
import IncomingRequests from '@/components/Friends/IncomingRequests';
import FriendsList from '@/components/Friends/Friends';
import Toggle from '@/components/Toggle';
import bubbles from '@/assets/images/bubbles.png';
import whiteBubbles from '@/assets/images/white-bubbles.png';
import starfish from '@/assets/images/starfish.png';
import whiteStarfish from '@/assets/images/white-starfish.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
  const router = useRouter();
  const hasPending = usePendingRequests();
  const setPending = useSetPendingRequests();
  const colorScheme = useColorScheme();

  const starfishImage =
    colorScheme === 'dark'
      ? whiteStarfish
      : starfish;

  const bubblesImage =
    colorScheme === 'dark'
      ? whiteBubbles
      : bubbles;

  const { user, profile, loading: userLoading, sessionChecked } = useSession();

  const qTab = useLocalSearchParams().tab;

  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'profile' | 'friends'>('profile');
  const [friendRefreshTick, setFriendRefreshTick] = useState(0);
  const [localHighScore, setLocalHighScore] = useState<number>(0);
  const [friendSubTab, setFriendSubTab] = useState<'list' | 'add' | 'requests'>(
    hasPending ? 'requests' : 'list'
  );

  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const selectedTextColor = colorScheme === 'dark' ? '#fff' : '#000';
  const linkColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.darkBlue;
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const selectedTab = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.white;
  const unselectedTab = colorScheme === 'dark' ? Colors.dark.background : Colors.custom.transparent;

  const code = profile?.friend_code ?? '';

  const isLoggedIn = !!user;

  const pushEnabled = profile?.expo_push_token !== null;

  const highScore = profile?.high_score ?? localHighScore;

  const profileStillLoading = userLoading || !sessionChecked || (user && !profile);

  async function copyCode() {
    if (!code || busy) return;
    setBusy(true);
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', 'Friend code copied to clipboard.');
    setBusy(false);
  }

  function ActionLegend() {
    return (
      <View style={styles.actions}>
        <View style={styles.actionWrapper}>
          <Text>
            <Image
              source={starfishImage}
              style={[styles.icon, { width: 20 }]}
            />
          </Text>
          <Text>
            Starfish hug
          </Text>
        </View>
        <View style={styles.actionWrapper}>
          <Text>
            <Image
              source={bubblesImage}
              style={[styles.icon, { width: 18 }]}
            />
          </Text>
          <Text>
            Breathe reminder
          </Text>
        </View>
      </View>
    );
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

    await removeStorageAndSession();
    Alert.alert('Success', 'Your account has been deleted.');
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
    await removeStorageAndSession();
    Alert.alert('Success', 'You have been logged out.');
  };

  const removeStorageAndSession = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    setLocalHighScore(0);
    router.replace('/welcome');
  };

  useEffect(() => {
    if (tab === 'friends' && hasPending && friendSubTab !== 'requests') {
      setFriendSubTab('requests');
    }
  }, [tab, hasPending]);

  useEffect(() => {
    if (qTab === 'requests') {
      setTab('friends');
      setFriendSubTab('requests');
      setPending(true);
    }
  }, [qTab]);

  useEffect(() => {
    if (profile) return;
    AsyncStorage.getItem('local_high_score')
      .then(val => {
        const parsed = parseInt(val ?? '0', 10);
        if (!isNaN(parsed)) {
          setLocalHighScore(parsed);
        }
      })
      .catch(() => setLocalHighScore(0));
  }, [profile]);

  if (profileStillLoading) return <Loader />;

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
              onPress={() => { setTab(key) }}
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

                {hasPending &&
                  key === 'friends' &&
                  !(tab === 'friends' && friendSubTab === 'requests') && (
                    <View style={styles.indicator} />
                  )}
              </View>

            </Pressable>
          ))}
        </View>

        <View style={styles.container}>
          <View style={{ display: tab === 'profile' ? 'flex' : 'none' }}>
            {isLoggedIn ? (
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
                  <FadeImage source={preyImg} style={styles.fishImage} />
                </View>

                <Text style={[styles.label, { borderBottomColor: greyBorder, color: textColor, paddingTop: 20 }]}>Push Notifications</Text>
                {pushEnabled !== null && (
                  <Toggle
                    value={pushEnabled}
                    onChange={async (next) => {
                      if (next) {
                        await registerForPushAsync(user!.id);
                      } else {
                        await supabase
                          .from('profiles')
                          .update({ expo_push_token: null })
                          .eq('user_id', user!.id);
                      }
                    }}
                  />
                )}
              </View>
            ) : (
              <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                <Text style={[styles.label, { borderBottomColor: greyBorder, color: textColor }]}>High Score</Text>
                <View style={styles.highScoreRow}>
                  <Text style={[styles.value, { color: textColor }]}>{highScore}</Text>
                  <FadeImage source={preyImg} style={styles.fishImage} />
                </View>
              </View>
            )}

            <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
              <FishCustomizer />
            </View>

            {isLoggedIn ? (
              <View style={styles.logoutWrapper}>
                <Button title="Log out" onPress={handleLogout} variant="tertiary" />
                <Button title="Delete account" onPress={handleDeleteAccount} variant="danger" />
              </View>
            ) : (
              <View style={styles.logoutWrapper}>
                <Button title="Log in" onPress={() => router.push('/login')} />
              </View>
            )}

            <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
              <Text>
                This app was made by one person, slowly and with love. No subscriptions. No locked features. Just a tiny project from me to you. Tips help me keep it alive!
              </Text>
              <Button
                title="Buy me a coffee"
                onPress={() => Linking.openURL('https://www.buymeacoffee.com/charlottebmoche')}
                variant="secondary"
                style={{ marginTop: 18 }}
              />
            </View>

          </View>
          <View style={{ display: tab === 'friends' ? 'flex' : 'none' }}>
            <View>
              {isLoggedIn ? (
                <>
                  <View
                    style={[
                      styles.tabBar, styles.tabBarFriends,
                      { borderColor: greyBorder, marginBottom: 30, }
                    ]}
                  >
                    {(['list', 'add', 'requests'] as const).map((key, idx, arr) => (
                      <Pressable
                        key={key}
                        onPress={() => { setFriendSubTab(key); }}
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

                  <View style={{ display: friendSubTab === 'list' ? 'flex' : 'none' }}>
                    <ActionLegend />
                  </View>

                  <View style={{ display: friendSubTab === 'list' ? 'flex' : 'none' }}>
                    <FriendsList refreshSignal={friendRefreshTick} />
                  </View>

                  {friendSubTab === 'add' && (
                    <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                      <Text style={styles.sectionTitle}>Send request</Text>
                      <AddByCode />
                    </View>
                  )}

                  {friendSubTab === 'requests' && (
                    <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                      <IncomingRequests
                        onChange={(pendingCount, accepted) => {
                          setFriendRefreshTick(n => n + 1);
                          setPending(pendingCount > 0);
                          if (accepted && pendingCount === 0 && friendSubTab === 'requests') {
                            setFriendSubTab('list');
                          }
                        }}
                      />
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.profileSection, { backgroundColor: cardColor }]}>
                  <Text style={{ textAlign: 'center', fontSize: 15, color: textColor }}>Log in to manage friends.</Text>
                </View>
              )}
            </View>
          </View>
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
    fontSize: 15,
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
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 15,
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
    marginBottom: 32,
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
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: 500,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    gap: 24,
    paddingBottom: 24,
  },
  actionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    height: 20,
  },
});