import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Button, Input, Text } from '@/components/Themed';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const router = useRouter();

  const logoImage =
    colorScheme === 'dark'
      ? require('@/assets/images/logo-light.png')
      : require('@/assets/images/logo-dark.png');

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data: { session } = {}, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Email already registered. Please log in.');
            setIsSignUp(false);
            setLoading(false);
            return;
          }
          setError(error.message);
          setLoading(false);
          return;
        }

        if (session) {
          router.replace('/');
          setLoading(false);
          return;
        } else {
          // No session returned, fallback login
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!loginError) {
            router.replace('/');
            setLoading(false);
            return;
          } else if (
            loginError.message.includes('Email not confirmed') ||
            loginError.message.includes('email not verified')
          ) {
            router.push({ pathname: '/verify', params: { email } });
            setLoading(false);
            return;
          } else {
            setError(loginError.message);
            setLoading(false);
            return;
          }
        }
      } else {
        // Login flow
        if (!password) {
          setError('Please enter your password.');
          setLoading(false);
          return;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          if (
            loginError.message.includes('Email not confirmed') ||
            loginError.message.includes('email not verified')
          ) {
            setError('Please verify your email first. Check your inbox.');
          } else if (loginError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password.');
          } else {
            setError(loginError.message);
          }
          setLoading(false);
          return;
        }

        router.replace('/');
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logo} />
          </View>

          <Input
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
          <Input
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            onPress={handleAuth}
            title={isSignUp ? 'Sign Up' : 'Log In'}
            loading={loading}
            disabled={loading}
          />

        <Pressable
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Log in' : 'No account? Sign up'}
          </Text>
        </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  switchText: {
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
  },
});
