import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  AppState,
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

    if (isSignUp) {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      if (!session) Alert.alert('Please check your inbox for email verification!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.replace('/');
      }
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? 'Create Account' : 'Welcome to Current'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
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
  },
  title: {
    fontSize: 26,
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
  },
  button: {
    backgroundColor: Colors.custom.lightBlue,
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
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
    textAlign: 'center',
  },
})
