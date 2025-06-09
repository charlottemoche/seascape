import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { setUser } = useUser(); // 👈 grab setUser from context

  const handleLogout = () => {
    setUser(null); // fake logout
    router.replace('/login'); // redirect to login
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Log out</Text>
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
    padding: 24,
  },
  button: {
    backgroundColor: '#cfe9f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    fontSize: 18,
    color: '#001f33',
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    color: '#001f33',
    fontWeight: '600',
  },
});