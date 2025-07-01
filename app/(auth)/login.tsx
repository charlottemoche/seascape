import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme,
  Image,
  Animated,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Button, Input, Text } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';
import { Icon } from '@/components/Icon';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);

  const shiftAnim = useKeyboardShift();

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const greyColor = colorScheme === 'dark' ? Colors.custom.darkGrey : '#aaa';

  const router = useRouter();

  const { reset } = useLocalSearchParams();

  const logoImage =
    colorScheme === 'dark'
      ? require('@/assets/images/logo-light.png')
      : require('@/assets/images/logo-dark.png');

  const messageColor = colorScheme === 'dark' ? Colors.custom.mediumBlue : Colors.custom.darkBlue;

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
            await AsyncStorage.setItem('pendingEmail', email);
            await AsyncStorage.setItem('pendingEmailSentAt', Date.now().toString());
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

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken;

      if (!idToken) throw new Error('no ID token present!');

      const nonce = decodeNonce(idToken);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce,
      });

      if (error) throw error;
      router.replace('/');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // already signing in
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services issue
      } else {
        console.error('Google sign-in error', error);
        setError('Google sign-in failed. Please try again.');
      }
    }
  };

  function decodeNonce(idToken: string): string | undefined {
    const [, payload] = idToken.split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64));
    return json.nonce;
  }

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
      scopes: ['profile', 'email'],
    });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
        return;
      }

      const pendingEmail = await AsyncStorage.getItem('pendingEmail');
      if (pendingEmail) {
        router.replace({ pathname: '/verify', params: { email: pendingEmail } });
      }
    };

    bootstrap();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { transform: [{ translateY: shiftAnim }], backgroundColor: backgroundColor }]}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logo} />
          </View>

          {reset === 'true' && (
            <Text style={[styles.message, { backgroundColor: messageColor }]}>
              Password reset. Please log in.
            </Text>
          )}

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
              title="Sign up"
              loading={loading}
              disabled={loading}
              variant="primary"
              style={{ marginTop: 20 }}
              width={200}
            />
          ) : (
            <Button
              onPress={handleAuth}
              title="Log in"
              loading={loading}
              disabled={loading}
              width={200}
            />
          )}

          <Button
            title={isSignUp ? 'Already have an account? Log in' : 'No account? Sign up'}
            onPress={() => { setIsSignUp(!isSignUp); setError('') }}
            variant="plain"
            style={{ marginTop: 20 }}
            width={300}
          />

          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: greyColor }]} />
            <Text style={[styles.dividerText, { color: greyColor }]}>Or</Text>
            <View style={[styles.line, { backgroundColor: greyColor }]} />
          </View>

          <Button
            onPress={handleGoogleLogin}
            icon={<Icon type="Google" name="google" color={greyColor} size={20} />}
            title="Continue with Google"
            loading={loading}
            disabled={loading}
            variant="tertiary"
            width={200}
          />


        </View>
      </Animated.View>
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
  switchText: {
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '90%',
  },
  forgotPasswordText: {
    marginBottom: 20,
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
  message: {
    fontSize: 15,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '80%',
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#ccc',
  },
});
