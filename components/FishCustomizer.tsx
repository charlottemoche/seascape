import React, { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';
import fishImages from '@/constants/fishMap';
import { FishColor } from '@/constants/fishMap';
import { Button, Input } from '@/components/Themed';
import { View, Text } from '@/components/Themed';

const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

export function FishCustomizer() {
  const { user } = useUser();
  const { profile } = useProfile();

  const [fishName, setFishName] = useState(profile?.fish_name ?? '');
  const [fishColor, setFishColor] = useState<FishColor>(
    availableColors.includes(profile?.fish_color as FishColor)
      ? (profile?.fish_color as FishColor)
      : 'blue'
  );
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

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

    if (editing) {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          fish_color: fishColor,
          fish_name: fishName,
        })
        .eq('user_id', user.id);

      setSaving(false);

      if (error) {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      } else {
        setEditing(false);
        Alert.alert('Success', 'Fish updated.');
      }
    } else {
      setEditing(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize Your Fish</Text>
      <View style={styles.colorOptions}>
        {availableColors.map((color) => (
          <Pressable
            key={color}
            onPress={() => {
              if (color !== fishColor) {
                setFishColor(color);
                setEditing(true);
              }
            }}
          >
            <Image
              source={fishImages[color]}
              style={[
                styles.smallFish,
                fishColor === color && editing && styles.selectedFish,
              ]}
            />
          </Pressable>
        ))}
      </View>

      <Image source={fishImages[fishColor]} style={styles.bigFish} />

      {editing ? (
        <Input
          value={fishName}
          onChangeText={setFishName}
          placeholder="Name your fish"
          placeholderTextColor="#888"
          style={styles.input}
        />
      ) : (
        <Text style={styles.fishNameText}>{fishName || 'Name your fish'}</Text>
      )}

      <Button
        onPress={handleSave}
        disabled={saving}
        loading={saving}
        title={saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
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
    borderBottomColor: '#000000',
    borderBottomWidth: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '80%',
    marginBottom: 20,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    fontWeight: '600',
  },
  fishNameText: {
    fontSize: 18,
    marginBottom: 20,
    height: 36,
  }
});