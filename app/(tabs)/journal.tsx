import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

const emotions = {
  positive: {
    label: 'Positive',
    color: Colors.custom.blue,
    options: ['Happy', 'Pleasant', 'Joyful'],
  },
  neutral: {
    label: 'Neutral',
    color: Colors.custom.green,
    options: ['Content', 'Tired', 'Other'],
  },
  negative: {
    label: 'Negative',
    color: Colors.custom.red,
    options: ['Sad', 'Frustrated', 'Anxious'],
  },
};

const pageSize = 10;

export default function JournalScreen() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to save your entry.');
      return;
    }

    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      feeling: selectedFeeling,
      entry: entry,
    });

    if (error) {
      alert('Something went wrong. Try again.');
      console.error(error);
    } else {
      setSelectedFeeling(null);
      setEntry('');
      alert('Journal entry saved!');
      handleGetEntries();
    }
  };

  const handleGetEntries = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching journal entries:', error);
      alert('Something went wrong while fetching your journal entries.');
    } else {
      setJournalEntries(prevEntries => [...prevEntries, ...data]);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  useEffect(() => {
    handleGetEntries();
  }, [page]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Journal</Text>
      <Text style={styles.subtitle}>How are you feeling today?</Text>
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

      <Text style={styles.prompt}>Want to write a little more?</Text>

      <TextInput
        value={entry}
        onChangeText={setEntry}
        multiline
        numberOfLines={5}
        style={styles.textArea}
        placeholder="Write your thoughts here..."
        placeholderTextColor="rgba(0, 31, 51, 0.7)"
      />

      <Pressable
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

      <Text style={styles.entriesTitle}>Your Journal Entries</Text>

      {journalEntries.length > 0 ? (
        <>
          {journalEntries.map((entry, index) => (
            <View key={index} style={styles.entryCard}>
              <Text style={styles.entryFeeling}>{entry.feeling}</Text>
              <Text style={styles.entryText}>{entry.entry}</Text>
              <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleString()}</Text>
            </View>
          ))}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#cfe9f1" />
            </View>
          ) : (
            <Pressable onPress={handleLoadMore} style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </Pressable>
          )}
        </>
      ) : (
        <Text style={styles.noEntries}>No entries yet!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.custom.background,
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
    padding: 16,
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(207, 233, 241, 0.1)'
  },
  categorySection: {
    marginBottom: 24,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
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
    marginVertical: 8,
  },
  entryDate: {
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
});