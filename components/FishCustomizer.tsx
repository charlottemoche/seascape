import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TextInput
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';
import fishImages from '@/constants/fishMap';
import { FishColor } from '@/constants/fishMap';
import Colors from '@/constants/Colors';

const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

export function FishCustomizer() {
  const { user } = useUser();
  const { profile, refreshProfile } = useProfile();

  const [fishName, setFishName] = useState(profile?.fish_name ?? '');
  const [fishColor, setFishColor] = useState<FishColor>(
    availableColors.includes(profile?.fish_color as FishColor)
      ? (profile?.fish_color as FishColor)
      : 'blue'
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFishName(profile?.fish_name ?? '');
  }, [profile?.fish_name]);

  useEffect(() => {
    setFishColor(
      availableColors.includes(profile?.fish_color as FishColor)
        ? (profile?.fish_color as FishColor)
        : 'blue'
    );
  }, [profile?.fish_color]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          fish_color: fishColor,
          fish_name: fishName,
        },
        { onConflict: 'user_id' }
      );

    setSaving(false);

    if (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } else {
      await refreshProfile();
      Alert.alert('Success', 'Profile updated.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize Your Fish</Text>

      <View style={styles.colorOptions}>
        {availableColors.map((color) => (
          <Pressable key={color} onPress={() => setFishColor(color)}>
            <Image
              source={fishImages[color]}
              style={[
                styles.smallFish,
                fishColor === color && styles.selectedFish,
              ]}
            />
          </Pressable>
        ))}
      </View>

      <Image source={fishImages[fishColor]} style={styles.bigFish} />

      <TextInput
        value={fishName}
        onChangeText={setFishName}
        placeholder="Name your fish"
        placeholderTextColor="#888"
        style={styles.input}
      />

      <Pressable
        onPress={handleSave}
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: Colors.custom.lightBlue,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  smallFish: {
    width: 40,
    height: 40,
  },
  bigFish: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  selectedFish: {
    borderBottomColor: '#fff',
    borderBottomWidth: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.custom.lightBlue,
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    width: '80%',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.custom.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: Colors.custom.background,
    fontWeight: '600',
  }
});