import React, { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
  Animated,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';
import fishImages from '@/constants/fishMap';
import { FishColor } from '@/constants/fishMap';
import { Button, Input } from '@/components/Themed';
import { View, Text } from '@/components/Themed';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';

type FishCustomizerProps = {
  lightText?: boolean;
};

const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

export function FishCustomizer({ lightText }: FishCustomizerProps) {
  const { user } = useUser();
  const { profile } = useProfile();

  const colorScheme = useColorScheme();

  const textColor = lightText || colorScheme === 'dark' ? '#fff' : '#000';

  const shiftAnim = useKeyboardShift(60, 300, 150);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { transform: [{ translateY: shiftAnim }] }]}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: textColor, fontSize: lightText ? 20 : 14 }]}>Customize Your Fish</Text>

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
              style={[styles.input, { color: textColor }]}
            />
          ) : (
            <Text style={[styles.fishNameText, { color: textColor, fontSize: lightText ? 16 : 14 }]}>{fishName || 'Name your fish'}</Text>
          )}

          <Button
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            title={saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
          />
        </View>
      </Animated.View>
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
    padding: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontWeight: '600',
    marginBottom: 24,
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
  selectedFish: {
    borderBottomColor: '#808080',
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
    marginBottom: 20,
    height: 36,
  }
});