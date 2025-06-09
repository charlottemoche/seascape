import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase';
import fishImages from '@/constants/fishMap';
import { FishColor } from '@/constants/fishMap';


export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, setUser } = useUser();

  const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

  const rawColor = profile?.fish_color;
  const initialColor = availableColors.includes(rawColor as FishColor)
    ? (rawColor as FishColor)
    : 'blue';

  const [fishName, setFishName] = useState(profile?.fish_name ?? '');
  const [fishColor, setFishColor] = useState<FishColor>(initialColor);

  const handleSave = async () => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ fish_color: fishColor, fish_name: fishName })
      .eq('user_id', user.id);

    // Optionally refresh user context if needed
  };

  const handleLogout = () => {
    setUser(null); // fake logout
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Pressable onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#001f33',
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    color: '#cfe9f1',
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
    borderBottomWidth: 2
  },
  input: {
    borderWidth: 1,
    borderColor: '#cfe9f1',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    width: '80%',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#cfe9f1',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#001f33',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 'auto',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: '#aaa',
    fontSize: 16,
    borderColor: '#aaa',
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 6
  },
});