import React, { useState, useEffect, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useStreaks } from '@/context/StreakContext';
import { updateStreak } from '@/lib/streakService';
import { View, Button, Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import JournalModal from '@/components/JournalModal';
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

  const backgroundColor = colorScheme === 'dark' ? Colors.custom.dark : '#f8f8f8';
  const cardColor = colorScheme === 'dark' ? Colors.dark.background : Colors.custom.white;
  const greyBorder = colorScheme === 'dark' ? '#292828' : Colors.custom.grey;
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  const { user, loading: authLoading } = useRequireAuth();
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
      <View style={styles.container}>
        <Text>You must be logged in to view journal entries.</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: backgroundColor }]}
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>How are you feeling?</Text>
          <View style={[{ backgroundColor: cardColor }, colorScheme === 'dark' ? styles.darkCard : styles.lightCard]}>
            {Object.entries(emotions).map(([categoryKey, category]) => (
              <View key={categoryKey} style={styles.categorySection}>
                <Text style={[styles.categoryTitle, { color: category.color }]}>{category.label}</Text>
                <View style={styles.feelingsContainer}>
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
                            Alert.alert('Limit Reached', 'You can only select up to 3 feelings.');
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

          <Text style={styles.prompt}>Want to write something? (optional)</Text>

          <>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={[styles.textArea, { backgroundColor: cardColor, borderColor: greyBorder }]}
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
              disabled={!selectedFeelings.length && !entry.trim()}
              title={'Save entry'}
              style={{ marginTop: 20 }}
            />
          </>


          {journalEntries.length > 0 || hasAnyEntries ? (
            entriesUnlocked ? (
              <>
                <Text style={styles.entriesTitle}>Your Journal Entries</Text>
                <View style={styles.entriesContainer}>
                  <Button onPress={handleLock} title="Lock" variant="secondary" />
                </View>
                {journalEntries.map((entry, index) => (
                  <View key={entry.id ?? index} style={[styles.entryCard, { borderColor: greyBorder }]}>
                    <View style={styles.entryHeader}>
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
                        <TabBarIcon
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
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    maxWidth: 400,
    alignSelf: 'center',
  },
  background: {
    flexGrow: 1,
    padding: 20,
  },
  entriesContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  darkCard: {
    borderColor: '#292828',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
  },
  lightCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(123, 182, 212, 0.5)',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  feelingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  feelingButton: {
    backgroundColor: 'rgba(207, 233, 241, 0.2)',
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
  prompt: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 40,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    overflow: 'hidden',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 18,
    marginTop: 40,
    marginBottom: 10,
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
    fontWeight: '500',
  },
  entryText: {
    fontSize: 14,
    marginTop: 8,
  },
  entryDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#808080',
  },
  noEntries: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
    marginTop: 20,
  },
  lockedText: {
    fontSize: 16,
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
    backgroundColor: 'transparent',
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
    fontSize: 16,
    fontWeight: '500',
  },
});