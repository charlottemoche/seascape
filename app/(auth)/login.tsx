import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import Colors from '@/constants/Colors';

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
    backgroundColor: Colors.custom.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 18,
    color: Colors.custom.lightBlue,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.custom.lightBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    fontSize: 18,
    color:  Colors.custom.background,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    color: Colors.custom.background,
    fontWeight: '600',
  },
});