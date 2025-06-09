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
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';
import fishImages from '@/constants/fishMap';
import { FishColor } from '@/constants/fishMap';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { profile } = useProfile();

  const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

  const rawColor = profile?.fish_color;
  const initialColor = availableColors.includes(rawColor as FishColor)
    ? (rawColor as FishColor)
    : 'blue';

  const [fishName, setFishName] = useState(profile?.fish_name ?? '');
  const [fishColor, setFishColor] = useState<FishColor>(initialColor);

  const handleSave = async () => {
    if (!user) return;
    console.log('Saving fish profile...', { fishColor, fishName });

    const { error } = await supabase
      .from('profiles')
      .update({ fish_color: fishColor, fish_name: fishName })
      .eq('user_id', user.id);

    if (error) {
      console.error('Save error:', error);
    } else {
      console.log('Profile saved!');
    }
  };

  const handleLogout = () => {
    setUser(null); // fake logout
    router.replace('/login');
  };

  return (
    <View style={styles.wrapper}>
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
      </View>

      <View style={styles.logoutWrapper}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
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

  logoutWrapper: {
    backgroundColor: Colors.custom.background,
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
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
    borderBottomWidth: 2
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
  },
  logoutButton: {
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