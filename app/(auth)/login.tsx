import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Button, Input, Text } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);

  const colorScheme = useColorScheme();
  const router = useRouter();

  const { verified, reset, deleted } = useLocalSearchParams();

  const logoImage =
    colorScheme === 'dark'
      ? require('@/assets/images/logo-light.png')
      : require('@/assets/images/logo-dark.png');

  const verifiedMessageColor = colorScheme === 'dark' ? Colors.custom.mediumBlue : Colors.custom.darkBlue;

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {

        if (password !== confirmedPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

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

          {verified === 'true' && (
            <Text style={[styles.verifiedMessage, { backgroundColor: verifiedMessageColor }]}>
              Email verified. Please log in.
            </Text>
          )}

          {reset === 'true' && (
            <Text style={[styles.verifiedMessage, { backgroundColor: verifiedMessageColor }]}>
              Password reset. Please log in.
            </Text>
          )}

          {
            deleted === 'true' && (
              <Text style={[styles.verifiedMessage, { backgroundColor: verifiedMessageColor }]}>
                Your account has been deleted.
              </Text>
            )
          }

          <Input
            placeholder='Email'
            placeholderTextColor='#888'
            autoComplete='email'
            autoCapitalize='none'
            autoCorrect={false}
            spellCheck={false}
            keyboardType='email-address'
            onChangeText={setEmail}
            value={email}
          />

          <View style={{ position: 'relative' }}>
            {/* Secure Input */}
            <Input
              placeholder='Password'
              autoComplete='password'
              placeholderTextColor='#888'
              secureTextEntry={true}
              onChangeText={setPassword}
              value={password}
              style={[{ paddingRight: 40 }, showPassword ? { height: 0, opacity: 0, position: 'absolute', top: 0 } : {}]}
            />
            {/* Plain Text Input */}
            <Input
              placeholder='Password'
              autoComplete='password'
              placeholderTextColor='#888'
              secureTextEntry={false}
              autoCapitalize='none'
              autoCorrect={false}
              spellCheck={false}
              onChangeText={setPassword}
              value={password}
              style={[{ paddingRight: 40 }, showPassword ? {} : { height: 0, opacity: 0, position: 'absolute', top: 0 }]}
            />

            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eye}
            >
              {showPassword ? <EyeOff size={20} color='#888' /> : <Eye size={20} color='#888' />}
            </Pressable>
          </View>

          {isSignUp && (
            <View style={{ position: 'relative' }}>
              <Input
                placeholder='Confirm password'
                autoComplete='password'
                placeholderTextColor='#888'
                secureTextEntry={true}
                onChangeText={setConfirmedPassword}
                value={confirmedPassword}
                style={[{ paddingRight: 40 }, showConfirmedPassword ? { height: 0, opacity: 0, position: 'absolute', top: 0 } : {}]}
              />
              <Input
                placeholder='Confirm password'
                autoComplete='password'
                placeholderTextColor='#888'
                secureTextEntry={false}
                autoCapitalize='none'
                autoCorrect={false}
                spellCheck={false}
                onChangeText={setConfirmedPassword}
                value={confirmedPassword}
                style={[{ paddingRight: 40 }, showConfirmedPassword ? {} : { height: 0, opacity: 0, position: 'absolute', top: 0 }]}
              />
              <Pressable
                onPress={() => setShowConfirmedPassword((prev) => !prev)}
                style={styles.eye}
              >
                {showConfirmedPassword ? <EyeOff size={20} color='#888' /> : <Eye size={20} color='#888' />}
              </Pressable>
            </View>
          )}


          {!isSignUp && (
            <View style={styles.forgotPasswordContainer}>
              <Pressable onPress={() => router.push('/reset')}>
                <Text style={styles.forgotPasswordText}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          {isSignUp ? (
            <Button
              onPress={handleAuth}
              title='Sign up'
              loading={loading}
              disabled={loading}
              variant='secondary'
              style={{ marginTop: 20 }}
            />
          ) : (
            <Button
              onPress={handleAuth}
              title='Log in'
              loading={loading}
              disabled={loading}
            />
          )}

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
    marginTop: 30,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '90%',
  },
  forgotPasswordText: {
    marginBottom: 30,
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
    width: '90%',
  },
  logo: {
    height: 90,
    width: 200,
    marginBottom: 60,
    resizeMode: 'contain',
  },
  verifiedMessage: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
