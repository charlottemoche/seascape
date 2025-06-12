import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  AppState,
  Image
} from 'react-native'
import { supabase } from '@/lib/supabase'
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const {
          data: { session },
          error,
        } = await supabase.auth.signUp({ email, password });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (!session) {
          Alert.alert('Please check your inbox for email verification!');
        } else {
          const user = session.user;

          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: user.id,
              email: user.email,
              onboarding_completed: false,
            },
          ]);

          if (profileError) {
            console.error('Failed to insert profile:', profileError.message);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError("Unable to log in. Please try again later.");
        } else {
          router.replace('/');
        }
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      setError("Something went wrong. Supabase might be down.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo-light.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>
        {isSignUp ? 'Create Account' : 'Login'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={handleAuth} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading
            ? 'Please wait...'
            : isSignUp
              ? 'Sign Up'
              : 'Log In'}
        </Text>
      </Pressable>

      <Pressable onPress={() => {
        setIsSignUp(!isSignUp)
        setError('')
      }}>
        <Text style={styles.switchText}>
          {isSignUp
            ? 'Already have an account? Log in'
            : 'No account? Sign up'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#cfe9f1',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.custom.lightBlue,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: '#fff',
    width: 280,
  },
  button: {
    backgroundColor: Colors.custom.lightBlue,
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    width: 280,
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.custom.background,
    fontWeight: 'bold',
  },
  switchText: {
    color: Colors.custom.lightBlue,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  logoContainer: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    height: 90,
    width: 200,
    marginBottom: 60,
    resizeMode: 'contain',
  }
})