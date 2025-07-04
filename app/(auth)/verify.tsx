import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Input, View } from '@/components/Themed';
import { Text } from '@/components/Themed';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialEmail =
    typeof params.email === 'string'
      ? params.email
      : Array.isArray(params.email)
        ? params.email[0]
        : '';

  const MIN_INTERVAL = 30;

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(MIN_INTERVAL);

  const shiftAnim = useKeyboardShift();

  useEffect(() => {
    (async () => {
      const ts = await AsyncStorage.getItem('pendingEmailSentAt');
      if (!ts) return;
      const elapsed = (Date.now() - Number(ts)) / 1000;
      const remaining = Math.max(0, MIN_INTERVAL - Math.floor(elapsed));
      setCooldown(remaining);
    })();
  }, []);

  const handleResend = async () => {
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      email,
      type: 'signup',
    });

    if (error) {
      Alert.alert('Resend failed', error.message);
    } else {
      await AsyncStorage.setItem('pendingEmailSentAt', Date.now().toString());
      setCooldown(30);
    }
    setResendLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });

    if (error) {
      Alert.alert('Verification failed', error.message);
    } else {
      await AsyncStorage.removeItem('pendingEmail');
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { transform: [{ translateY: shiftAnim }] }]}>
        <View style={styles.container}>
          <View style={styles.inner}>
            <Text style={styles.header}>Please check your email for verfication code</Text>
            <Input
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              value={email}
              onChangeText={setEmail}
            />

            <Input
              placeholder="6-digit code"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />

            <Button
              loading={loading}
              onPress={handleVerify}
              disabled={loading}
              title={loading ? 'Verifying...' : 'Verify email'}
            />

            <Button
              variant="secondary"
              loading={resendLoading}
              onPress={handleResend}
              disabled={resendLoading || cooldown > 0}
              style={{ marginTop: 20 }}
              title={cooldown > 0 ? `Send again in ${cooldown}s` : 'Send again'}
            />
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  inner: {
    padding: 24,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 500,
  },
  header: {
    fontSize: 15,
    paddingBottom: 24,
  },
});