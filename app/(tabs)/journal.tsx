import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { updateStreak } from '@/lib/streakService';
import { useStreaks } from '@/context/StreakContext';
import Colors from '@/constants/Colors';

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
  const { user, loading: authLoading } = useRequireAuth();
  const { refreshStreaks } = useStreaks();

  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
        feeling: selectedFeeling,
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

    // Success path
    setJournalEntries((prev) => [data, ...prev]);
    setSelectedFeeling(null);
    setEntry('');
    Alert.alert('Journal entry saved!');

    try {
      await updateStreak(user.id, 'journal');
      await refreshStreaks();
    } catch (e) {
      console.error('Failed to update streak:', e);
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.custom.lightBlue} />
      </View>
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
    <SafeAreaView style={styles.backgroundColor}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>How are you feeling?</Text>
          <View style={styles.categoryContainer}>
            {Object.entries(emotions).map(([categoryKey, category]) => (
              <View key={categoryKey} style={styles.categorySection}>
                <Text style={[styles.categoryTitle, { color: category.color }]}>{category.label}</Text>
                <View style={styles.feelingsContainer}>
                  {category.options.map((feeling) => (
                    <Pressable
                      key={feeling}
                      onPress={() =>
                        setSelectedFeeling((prev) => (prev === feeling ? null : feeling))
                      }
                      style={[
                        styles.feelingButton,
                        selectedFeeling === feeling && styles.selectedFeelingButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.feelingText,
                          selectedFeeling === feeling && styles.selectedFeelingText,
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
            style={styles.textArea}
            placeholder="Write your thoughts here..."
            placeholderTextColor="rgba(0, 31, 51, 0.7)"
          />

          <Pressable
            testID="journal-submit-button"
            onPress={handleSubmit}
            disabled={!selectedFeeling && !entry}
            style={({ pressed }) => [
              styles.submitButton,
              (!selectedFeeling && !entry) && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.submitText}>Save Entry</Text>
          </Pressable>


          {journalEntries.length > 0 &&
            <>
              <Text style={styles.entriesTitle}>Your Journal Entries</Text>
              {journalEntries.map((entry, index) => (
                <View key={entry.id ?? index} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryFeeling}>{entry.feeling ?? 'Entry'}</Text>
                    <Pressable onPress={() => handleDeleteEntry(entry.id)}>
                      <TabBarIcon
                        type="AntDesign"
                        name="delete"
                        color={Colors.custom.red}
                        size={16}
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
                  <ActivityIndicator size="large" color={Colors.custom.lightBlue} />
                </View>
              ) : hasMore ? (
                <Pressable onPress={handleLoadMore} style={styles.loadMoreButton}>
                  <Text style={styles.loadMoreText}>Load More</Text>
                </Pressable>
              ) : null}
            </>
          }
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.custom.background,
    padding: 20,
  },
  backgroundColor: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryContainer: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(207, 233, 241, 0.1)'
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    color: Colors.custom.lightBlue,
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
    backgroundColor: 'rgba(207, 233, 241, 0.8)',
    borderColor: '#fff',
  },
  feelingText: {
    color: '#fff',
    fontWeight: '500',
  },
  selectedFeelingText: {
    color: Colors.custom.background,
    fontWeight: '600',
  },
  prompt: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 20,
  },
  textArea: {
    backgroundColor: 'rgba(207, 233, 241, 0.7)',
    borderRadius: 8,
    padding: 10,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.custom.lightBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.8,
  },
  submitText: {
    color: Colors.custom.background,
    fontWeight: '600',
    fontSize: 16,
  },
  entriesTitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: 'rgba(207, 233, 241, 0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  entryFeeling: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.custom.lightBlue,
  },
  entryText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  entryDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#ccc',
  },
  noEntries: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  loadMoreButton: {
    marginTop: 20,
    backgroundColor: Colors.custom.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: Colors.custom.background,
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor: Colors.custom.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});