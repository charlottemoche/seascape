import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/utils/supabase';
import Colors from '@/constants/Colors';

const emotions = {
  positive: {
    label: 'Positive',
    options: ['Happy', 'Pleasant', 'Joyful'],
  },
  neutral: {
    label: 'Neutral',
    options: ['Content', 'Tired', 'Other'],
  },
  negative: {
    label: 'Negative',
    options: ['Sad', 'Frustrated', 'Anxious'],
  },
};

export default function JournalScreen() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [entry, setEntry] = useState('');

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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>

      {Object.entries(emotions).map(([categoryKey, category]) => (
        <View key={categoryKey} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category.label}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f33',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 8,
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
    color: '#001f33',
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
    color: '#001f33',
    fontWeight: '600',
    fontSize: 16,
  },
});