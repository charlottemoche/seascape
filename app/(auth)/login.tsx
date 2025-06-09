import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useUser();

  const handleFakeLogin = () => {
    setUser({ id: 'fake-user-id' });
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>This is the fake login screen.</Text>

      <Pressable onPress={handleFakeLogin} style={styles.button}>
        <Text style={styles.buttonText}>Log in</Text>
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
  message: {
    fontSize: 18,
    color: '#cfe9f1',
    textAlign: 'center',
    marginBottom: 20,
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