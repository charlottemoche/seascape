import React, { useState, useEffect, useCallback } from 'react';
import {
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useStreaks } from '@/context/StreakContext';
import Colors from '@/constants/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updateStreak } from '@/lib/streakService';
import { View, Button, Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';

const emotions = {
  positive: {
    label: 'Positive',
    color: Colors.custom.blue,
    options: ['Happy', 'Pleasant', 'Joyful', 'Excited', 'Grateful', 'Hopeful'],
  },
  neutral: {
    label: 'Neutral',
    color: Colors.custom.green,
    options: ['Content', 'Calm', 'Indifferent'],
  },
  negative: {
    label: 'Negative',
    color: Colors.custom.red,
    options: ['Sad', 'Frustrated', 'Anxious', 'Tired', 'Angry', 'Stressed'],
  },
};

const pageSize = 10;

export default function JournalScreen() {
  const colorScheme = useColorScheme();

  const containerColor = colorScheme === 'dark' ? '#161618' : Colors.custom.white;
  const backgroundColor = colorScheme === 'dark' ? Colors.custom.dark : '#f8f8f8';
  const cardColor = colorScheme === 'dark' ? Colors.dark.background : Colors.custom.white;
  const greyBorder = colorScheme === 'dark' ? '#292828' : Colors.custom.grey;

  const { user, loading: authLoading } = useRequireAuth();
  const { refreshStreaks } = useStreaks();

  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('You must be logged in to save your entry.');
      return;
    }
    if (submitLoading) return;

    setSubmitLoading(true);

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        feeling: selectedFeelings,
        entry,
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

  const handleGetEntries = useCallback(async () => {
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
      // Merge new data without duplicates
      const mergedMap = new Map();
      [...journalEntries, ...data].forEach((entry) => {
        mergedMap.set(entry.id, entry); // last one wins
      });
      setJournalEntries(Array.from(mergedMap.values()));

      // Update "hasMore"
      setHasMore(data.length === pageSize);
    }
    setLoading(false);
  }, [page, user, journalEntries]);

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

  useEffect(() => {
    if (!authLoading && user) {
      handleGetEntries();
    }
  }, [page, user, authLoading]);

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
    <SafeAreaView style={{ backgroundColor: backgroundColor, flex: 1 }}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          enableOnAndroid
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
        >
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

          <Text style={styles.prompt}>Want to write something?</Text>

          <TextInput
            testID="journal-entry-input"
            value={entry}
            onChangeText={setEntry}
            multiline
            numberOfLines={5}
            style={[styles.textArea, { backgroundColor: containerColor, borderColor: greyBorder }]}
            placeholder="Write your thoughts here..."
            placeholderTextColor='#808080'
          />

          <Button
            testID="journal-submit-button"
            onPress={handleSubmit}
            disabled={!selectedFeelings.length && !entry}
            title={'Save Entry'}
          >
          </Button>


          {journalEntries.length > 0 &&
            <>
              <Text style={styles.entriesTitle}>Your Journal Entries</Text>
              {journalEntries.map((entry, index) => (
                <View key={entry.id ?? index} style={[styles.entryCard, { borderColor: greyBorder }]}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {Array.isArray(entry.feeling) ? entry.feeling.join(', ') : entry.feeling ?? 'Entry'}
                    </Text>
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

                  {entry.entry ? (
                    <Text style={styles.entryText}>{entry.entry}</Text>
                  ) : null}

                  <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleString()}</Text>
                </View>
              ))}

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.custom.blue} />
                </View>
              ) : hasMore ? (
                <Button onPress={handleLoadMore} title="Load More" />
              ) : null}
            </>
          }
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
    height: 120,
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
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
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
});