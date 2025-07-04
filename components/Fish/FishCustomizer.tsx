import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
} from 'react-native';
import { FadeImage } from '../FadeImage';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase';
import { FishColor } from '@/constants/fishMap';
import { Button } from '@/components/Themed';
import { View, Text } from '@/components/Themed';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fishImages from '@/constants/fishMap';
import FishModal from './FishModal';

type FishCustomizerProps = {
  transparent?: boolean;
  onSaved?: () => void;
};

const BASE_COLORS: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

export function FishCustomizer({ transparent, onSaved }: FishCustomizerProps) {
  const { user, profile } = useSession();

  const colorScheme = useColorScheme();
  const textColor = transparent || colorScheme === 'dark' ? '#fff' : '#000';

  const [fishName, setFishName] = useState('');
  const [fishColor, setFishColor] = useState<FishColor>('blue');
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasTipped, setHasTipped] = useState(false);

  const availableColors: FishColor[] = useMemo(() => {
    if (hasTipped) {
      return [...BASE_COLORS, 'rainbow', 'colored'];
    }
    return BASE_COLORS;
  }, [hasTipped]);

  useEffect(() => {
    if (user?.id) {
      setHasTipped(!!profile?.has_tipped);
    } else {
      AsyncStorage.getItem('has_tipped').then(tipped => {
        if (tipped === 'true') setHasTipped(true);
      });
    }
  }, [user?.id, profile?.has_tipped]);

  useEffect(() => {
    if (!availableColors.includes(fishColor)) {
      setFishColor(availableColors[0]);
    }
  }, [availableColors, fishColor]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('tipped', () => {
      setHasTipped(true);
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!user) return;

    setFishName(profile?.fish_name ?? '');
    setFishColor(
      availableColors.includes(profile?.fish_color as FishColor)
        ? (profile?.fish_color as FishColor)
        : 'blue'
    );
  }, [user, profile?.fish_name, profile?.fish_color, availableColors]);

  useEffect(() => {
    if (user) return;
    if (!availableColors.length) return;

    (async () => {
      const [storedName, storedColor] = await AsyncStorage.multiGet([
        'fish_name',
        'fish_color',
      ]).then(entries => entries.map(([, v]) => v));

      setFishName(storedName ?? '');
      if (storedColor && availableColors.includes(storedColor as FishColor)) {
        setFishColor(storedColor as FishColor);
      } else {
        setFishColor('blue');
      }
    })();
  }, [user, availableColors]);

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

        <FadeImage source={fishImages[fishColor]} style={styles.bigFish} />

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