import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
} from 'react-native';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase';
import { FishColor } from '@/constants/fishMap';
import { Button } from '@/components/Themed';
import { View, Text } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fishImages from '@/constants/fishMap';
import FishModal from './FishModal';

type FishCustomizerProps = {
  transparent?: boolean;
  onSaved?: () => void;
};

const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

export function FishCustomizer({ transparent, onSaved }: FishCustomizerProps) {
  const { user, profile } = useSession();

  const colorScheme = useColorScheme();
  const textColor = transparent || colorScheme === 'dark' ? '#fff' : '#000';

  const [fishName, setFishName] = useState('');
  const [fishColor, setFishColor] = useState<FishColor>('blue');
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log('[FishCustomizer] mounted');
    return () => console.log('[FishCustomizer] unmounted');
  }, []);

  useEffect(() => {
    console.log('[FishImg] source', fishImages[fishColor]);
  }, [fishColor]);

  useEffect(() => {
    if (user) {
      setFishName(profile?.fish_name ?? '');
      setFishColor(
        availableColors.includes(profile?.fish_color as FishColor)
          ? (profile?.fish_color as FishColor)
          : 'blue'
      );
    } else {
      setFishName('');
      setFishColor('blue');
      (async () => {
        const storedName = await AsyncStorage.getItem('fish_name');
        const storedColor = await AsyncStorage.getItem('fish_color');
        if (storedName) setFishName(storedName);
        if (storedColor && availableColors.includes(storedColor as FishColor)) {
          setFishColor(storedColor as FishColor);
        }
      })();
    }
  }, [user, profile]);

  const handleSave = async (newName: string, newColor: FishColor) => {
    const trimmedName = newName.trim();
    if (trimmedName.length > 12) {
      Alert.alert('Name too long', 'Please use 12 characters or less.');
      return;
    }

    setSaving(true);

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ fish_color: newColor, fish_name: trimmedName })
        .eq('user_id', user.id);

      setSaving(false);

      if (error) {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
        return;
      }
    } else {
      await AsyncStorage.multiSet([
        ['fish_name', trimmedName],
        ['fish_color', newColor],
      ]);
      setSaving(false);
    }

    setModalVisible(false);
    setFishName(trimmedName);
    setFishColor(newColor);
    onSaved?.();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (modalVisible) setModalVisible(false);
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        {transparent ? (
          <Text style={[styles.title, { color: textColor, fontSize: 20 }]}>
            Customize Your Fish
          </Text>
        ) : (
          <Text style={[styles.fishNameText, { color: textColor }]}>
            {fishName || 'Name me!'}
          </Text>
        )}

        <Image source={fishImages[fishColor]} style={styles.bigFish} />

        <Button title="Edit" onPress={() => setModalVisible(true)} variant={transparent ? 'primary' : 'secondary'} />

        <FishModal
          visible={modalVisible}
          initialText={fishName}
          initialColor={fishColor}
          onSave={handleSave}
          onCancel={() => setModalVisible(false)}
          saving={saving}
          availableColors={availableColors}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  title: {
    fontWeight: 500,
    marginBottom: 12
  },
  bigFish: {
    width: 100,
    height: 100,
    marginBottom: 24
  },
  fishNameText: {
    height: 36,
    fontSize: 18,
    fontWeight: 500
  },
});