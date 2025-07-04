import React, { useState, useEffect, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { useSession } from '@/context/SessionContext';
import { useStreaks } from '@/context/StreakContext';
import { updateStreak } from '@/lib/streakService';
import { View, Button, Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { useRouter } from 'expo-router';
import JournalModal from '@/components/Modals/JournalModal';
import Colors from '@/constants/Colors';
import CryptoJS from 'crypto-js';
import * as LocalAuthentication from 'expo-local-authentication';

const emotions = {
  positive: {
    label: 'Positive',
    color: Colors.custom.blue,
    options: ['Happy', 'Pleasant', 'Joyful', 'Excited', 'Grateful', 'Hopeful', 'Content'],
  },
  neutral: {
    label: 'Neutral',
    color: Colors.custom.green,
    options: ['Calm', 'Indifferent', 'Tired'],
  },
  negative: {
    label: 'Negative',
    color: Colors.custom.red,
    options: ['Sad', 'Frustrated', 'Anxious', 'Angry', 'Stressed', 'Lonely'],
  },
};

const pageSize = 6;

export default function JournalScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  const inputColor = colorScheme === 'dark' ? Colors.dark.input : '#fff';
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  const { user, loading: authLoading } = useSession();
  const { refreshStreaks } = useStreaks();

  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [entriesUnlocked, setEntriesUnlocked] = useState(false);
  const [hasAnyEntries, setHasAnyEntries] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const loaderColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.lightBlue;

  function getEncryptionKey(userId: string): string {
    return CryptoJS.SHA256(userId).toString();
  }

  function encryptText(text: string, userId: string): string {
    const key = getEncryptionKey(userId);
    return CryptoJS.AES.encrypt(text, key).toString();
  }

  function decryptText(ciphertext: string, userId: string): string {
    const key = getEncryptionKey(userId);
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      console.error('Decryption failed:', err);
      return '';
    }
  }

  const checkHasEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (error) {
      console.error('Error checking for entries:', error);
      setHasAnyEntries(false);
    } else {
      setHasAnyEntries(data.length > 0);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('You must be logged in to save your entry.');
      return;
    }

    if (!selectedFeelings.length) {
      Alert.alert('Error', 'Please select at least one feeling.');
      return;
    }

    if (submitLoading) return;

    setSubmitLoading(true);

    const encryptedEntry = encryptText(entry, user.id);
    const encryptedFeelings = encryptText(JSON.stringify(selectedFeelings), user.id);

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        feeling: encryptedFeelings,
        entry: encryptedEntry,
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Something went wrong. Try again.');
      console.error(error);
      setSubmitLoading(false);
      return;
    }

    setJournalEntries((prev) => [data, ...prev]);
    setSelectedFeelings([]);
    setEntry('');
    Alert.alert('Journal entry saved!');

    try {
      const result = await updateStreak(user.id, 'journal', userTimezone);
      if (result.success) {
        await refreshStreaks();
      } else {
        console.warn('Streak update failed, skipping refresh');
      }
    } catch (e) {
      console.error('Error updating journal streak:', e);
    }

    setSubmitLoading(false);
  };

  const handleGetEntries = useCallback(async (page = 0) => {
    if (!user) return;
    setLoading(true);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching journal entries:', error);
      Alert.alert('Something went wrong while fetching your journal entries.');
    } else {
      setJournalEntries(prevEntries => {
        if (page === 0) {
          // On first page, replace entries
          return data;
        }
        // On subsequent pages, merge
        const mergedMap = new Map();
        [...prevEntries, ...data].forEach(entry => mergedMap.set(entry.id, entry));
        return Array.from(mergedMap.values());
      });
      setHasMore(data.length === pageSize);
    }
    setLoading(false);
  }, [user]);

  const handleDeleteEntry = (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('journal_entries')
              .delete()
              .eq('id', id);

            if (error) {
              Alert.alert('Error', 'Error deleting entry.');
              console.error(error);
            } else {
              setJournalEntries((prev) => prev.filter((e) => e.id !== id));
              Alert.alert('Success', 'Entry deleted successfully.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    setPage((prev) => prev + 1);
  };

  const handleUnlock = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Not available', 'Enable Face ID or passcode to unlock.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Journal',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setEntriesUnlocked(true);
      setPage(0);
    } else {
      Alert.alert('Authentication failed', 'Unable to unlock journal.');
    }
  };

  const handleLock = () => {
    setEntriesUnlocked(false);
    setJournalEntries([]);
    setPage(0);
  };

  useEffect(() => {
    if (!authLoading && user) {
      checkHasEntries();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (entriesUnlocked) {
      handleGetEntries(page);
    }
  }, [page, entriesUnlocked, handleGetEntries]);

  if (authLoading) {
    return (
      <Loader />
    );
  }

  if (!user) {
    return (
      <View style={styles.guestView}>
        <Text style={styles.logInText}>You must log in or create an account</Text>
        <Text style={styles.logInText}>to access your journal.</Text>
        <Button title="Log in" onPress={() => router.push('/login')} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundColor }]}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); if (modalVisible) setModalVisible(false); }} accessible={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.inner}>
              <Text style={styles.title}>Journal</Text>
              <Text style={styles.subtitle}>How are you feeling?</Text>
              <View style={[styles.card, { backgroundColor: cardColor }]}>
                {Object.entries(emotions).map(([categoryKey, category]) => (
                  <View key={categoryKey} style={[styles.categorySection, { backgroundColor: cardColor }]}>
                    <Text style={[styles.categoryTitle, { color: category.color }]}>{category.label}</Text>
                    <View style={[styles.feelingsContainer, { backgroundColor: cardColor }]}>
                      {category.options.map((feeling) => (
                        <Pressable
                          key={feeling}
                          onPress={() => {
                            setSelectedFeelings((prev) => {
                              if (prev.includes(feeling)) {
                                return prev.filter((f) => f !== feeling);
                              } else if (prev.length < 3) {
                                return [...prev, feeling];
                              } else {
                                Alert.alert('Limit Reached', 'Select up to 3 feelings.');
                                return prev;
                              }
                            });
                          }}
                          style={[
                            styles.feelingButton,
                            selectedFeelings.includes(feeling) && styles.selectedFeelingButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.feelingText,
                              selectedFeelings.includes(feeling) && styles.selectedFeelingText,
                            ]}
                          >
                            {feeling}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.subtitle}>Want to write something? (optional)</Text>

              <>
                <Pressable
                  onPress={() => setModalVisible(true)}
                  style={[styles.textArea, { backgroundColor: inputColor }]}
                >
                  <Text
                    style={{ color: entry ? textColor : '#888' }}
                    numberOfLines={4}
                    ellipsizeMode="tail"
                  >
                    {entry || 'Write your thoughts here...'}
                  </Text>
                </Pressable>

                <JournalModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  text={entry}
                  onChangeText={setEntry}
                />

                <Button
                  onPress={handleSubmit}
                  title={'Save entry'}
                  style={{ marginTop: 20 }}
                />
              </>


              {journalEntries.length > 0 || hasAnyEntries ? (
                entriesUnlocked ? (
                  <>
                    <Text style={styles.entriesTitle}>Your journal entries</Text>
                    <View style={styles.entriesContainer}>
                      <Button onPress={handleLock} title="Lock" variant="secondary" />
                    </View>
                    {journalEntries.map((entry, index) => (
                      <View key={entry.id ?? index} style={[styles.entryCard, { borderColor: greyBorder, backgroundColor: cardColor }]}>
                        <View style={[styles.entryHeader, { backgroundColor: cardColor }]}>
                          {(() => {
                            let decryptedFeelings = [];
                            if (typeof entry.feeling === 'string') {
                              try {
                                const decryptedStr = decryptText(entry.feeling, user.id);
                                decryptedFeelings = JSON.parse(decryptedStr);
                              } catch {
                                decryptedFeelings = [];
                              }
                            }
                            return (
                              <Text style={styles.entryTitle}>
                                {Array.isArray(decryptedFeelings) && decryptedFeelings.length > 0
                                  ? decryptedFeelings.join(', ')
                                  : 'Entry'}
                              </Text>
                            );
                          })()}
                          <Pressable onPress={() => handleDeleteEntry(entry.id)}>
                            <Icon
                              type="AntDesign"
                              name="delete"
                              color={Colors.custom.red}
                              size={16}
                              style={{ marginBottom: 2 }}
                            />
                          </Pressable>
                        </View>

                        {(() => {
                          const decrypted = decryptText(entry.entry, user.id);
                          return decrypted ? (
                            <Text style={styles.entryText}>{decrypted}</Text>
                          ) : null;
                        })()}

                        <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleString()}</Text>
                      </View>
                    ))}

                    {loading ? (
                      <View style={styles.entriesContainer}>
                        <ActivityIndicator size="large" color={loaderColor} />
                      </View>
                    ) : hasMore ? (
                      <Button onPress={handleLoadMore} title="Load more" />
                    ) : null}
                  </>
                ) : (
                  <View style={styles.entriesContainer}>
                    <Text style={styles.lockedText}>Your journal is locked.</Text>
                    <Button onPress={handleUnlock} title="Unlock" variant="secondary" />
                  </View>
                )
              ) : (
                <View style={styles.entriesContainer}>
                  <Text style={styles.noEntries}>
                    You have no journal entries.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  inner: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  entriesContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 500,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(123, 182, 212, 0.4)',
  },
  feelingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  feelingButton: {
    backgroundColor: 'rgba(207, 233, 241, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 1,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedFeelingButton: {
    backgroundColor: 'rgba(207, 233, 241, 0.6)',
    borderColor: '#7bb6d4',
    borderWidth: 1,
  },
  feelingText: {
    fontWeight: 400,
  },
  selectedFeelingText: {
    fontWeight: 500,
    color: '#000000',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    overflow: 'hidden',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderColor: 'rgba(123, 182, 212, 0.4)',
  },
  entriesTitle: {
    fontSize: 15,
    marginTop: 40,
    textAlign: 'center',
  },
  entryCard: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: 500,
  },
  entryText: {
    fontSize: 14,
    marginVertical: 4,
  },
  entryDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#808080',
  },
  noEntries: {
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
    marginTop: 20,
  },
  lockedText: {
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  loading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  modalButtonContainer: {
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: Colors.custom.blue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 500,
  },
  guestView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
});