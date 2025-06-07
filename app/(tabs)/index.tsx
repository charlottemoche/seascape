import { View, Text, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import waveBackground from '@/assets/images/wave.png';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={waveBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to Current</Text>
        <Text style={styles.subtitle}>A calming journey beneath the surface</Text>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={() => router.push('/swim')}>
            <Text style={styles.buttonText}>Swim</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => router.push('/breathe')}>
            <Text style={styles.buttonText}>Breathe</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 30, 50, 0.4)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#cfe9f1',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});
