import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      <Pressable onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f33',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#cfe9f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#001f33',
    fontWeight: '600',
    fontSize: 16,
  },
});