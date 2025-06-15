import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  AppState,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import Constants from 'expo-constants';

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
        // Attempt to sign up
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
          // User signed up & logged in
          const user = session.user;

          // Check and insert profile if missing
          const { data: existingProfile, error: profileQueryError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

          if (profileQueryError && profileQueryError.code !== 'PGRST116') {
            console.error('Profile query error:', profileQueryError);
          }

          if (!existingProfile) {
            const { error: insertError } = await supabase.from('profiles').insert([
              {
                user_id: user.id,
                email: user.email,
                onboarding_completed: false,
              },
            ]);
            if (insertError) {
              console.error('Profile insert error:', insertError.message);
            }
          }

          router.replace('/');
          setLoading(false);
          return;
        } else {
          // No session returned, try logging in to check user status
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!loginError) {
            // Login succeeded, user confirmed
            router.replace('/');
            setLoading(false);
            return;
          } else if (
            loginError.message.includes('Email not confirmed') ||
            loginError.message.includes('email not verified')
          ) {
            // User exists but not verified
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

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
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

        // After successful login, create profile if missing
        const user = loginData.user;

        const { data: profile, error: profileQueryError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (profileQueryError && profileQueryError.code !== 'PGRST116') {
          console.error('Profile query error:', profileQueryError);
        }

        if (!profile) {
          const { error: insertError } = await supabase.from('profiles').insert([
            {
              user_id: user.id,
              onboarding_completed: false,
            },
          ]);
          if (insertError) {
            console.error('Profile insert error:', insertError.message);
          }
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

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();

      if (tokens.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: tokens.idToken,
        });

        if (error) {
          console.error('Supabase login error:', error.message);
          Alert.alert('Google login failed');
        } else {
          router.replace('/');
        }
      } else {
        throw new Error('No ID token found');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // already signing in
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services not available');
      } else {
        console.error('Google sign-in error:', error);
        Alert.alert('Google Sign-In failed', error.message);
      }
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: Constants.expoConfig?.extra?.googleIosClientId!,
      scopes: ['profile', 'email'],
    });
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/logo-light.png')} style={styles.logo} />
        </View>

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

        <Pressable onPress={handleAuth} style={[isSignUp ? styles.signUpButton : styles.logInButton, styles.button]} disabled={loading}>
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

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separatorLine} />
        </View>

        <GoogleSigninButton
          style={styles.googleButton}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleLogin}
        />
      </View>
    </TouchableWithoutFeedback>
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
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    width: 280,
  },
  logInButton: {
    backgroundColor: Colors.custom.lightBlue,
  },
  signUpButton: {
    backgroundColor: Colors.custom.blue,
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
  },
  googleButton: {
    borderRadius: 20,
    width: 280,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: 160,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.custom.lightBlue,
  },
  separatorText: {
    marginHorizontal: 12,
    color: Colors.custom.lightBlue,
    fontWeight: '600',
    fontSize: 14,
  },

})