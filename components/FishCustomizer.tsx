import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';
import fishImages from '@/constants/fishMap';
import { FishColor } from '@/constants/fishMap';
import { Button } from '@/components/Themed';
import { View, Text } from '@/components/Themed';
import FishModal from './FishModal';

type FishCustomizerProps = {
  transparent?: boolean;
  onSaved?: () => void;
};

const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

export function FishCustomizer({ transparent, onSaved }: FishCustomizerProps) {
  const { user } = useUser();
  const { profile } = useProfile();

  const colorScheme = useColorScheme();

  const textColor = transparent || colorScheme === 'dark' ? '#fff' : '#000';

  const [fishName, setFishName] = useState(profile?.fish_name ?? '');
  const [fishColor, setFishColor] = useState<FishColor>(
    availableColors.includes(profile?.fish_color as FishColor)
      ? (profile?.fish_color as FishColor)
      : 'blue'
  );
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleSave = async (newName: string, newColor: FishColor) => {
    const trimmedName = newName.trim();

    if (trimmedName.length > 12) {
      Alert.alert('Name too long', 'Please use 12 characters or less.');
      return;
    }

    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        fish_color: newColor,
        fish_name: newName,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } else {
      setModalVisible(false);
      setFishName(newName);
      setFishColor(newColor);
      Alert.alert('Success', 'Fish updated.');
      onSaved?.();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => { if (modalVisible) setModalVisible(false); Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <View style={styles.container}>

          {transparent ? (
            <Text style={[styles.title, { color: textColor, fontSize: transparent ? 20 : 16 }]}>Customize Your Fish</Text>
          ) : (
            <Text style={[styles.fishNameText, { color: textColor }]}>{fishName || ''}</Text>
          )}

          <Image source={fishImages[fishColor]} style={styles.bigFish} />


          <Button title="Edit" onPress={() => setModalVisible(true)} variant="secondary" />

          <FishModal
            visible={modalVisible}
            initialText={fishName || ''}
            initialColor={fishColor}
            onSave={(newName, newColor) => handleSave(newName, newColor)}
            onCancel={() => setModalVisible(false)}
            saving={saving}
            availableColors={availableColors}
          />

        </View>
      </View>
    </TouchableWithoutFeedback>
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
    backgroundColor: 'transparent',
  },
  title: {
    fontWeight: 600,
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  smallFish: {
    width: 32,
    height: 32,
  },
  bigFish: {
    width: 100,
    height: 100,
    marginBottom: 24,
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
    fontWeight: 600,
  },
  fishNameText: {
    height: 36,
    fontSize: 18,
    fontWeight: 600,
  }
});