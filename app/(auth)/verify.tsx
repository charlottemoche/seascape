import React, { useState } from 'react';
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

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialEmail =
    typeof params.email === 'string'
      ? params.email
      : Array.isArray(params.email)
        ? params.email[0]
        : '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const shiftAnim = useKeyboardShift();

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
      router.replace({
        pathname: '/login',
        params: { verified: 'true' },
      });
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
  },
  header: {
    fontSize: 16,
    paddingBottom: 24,
  },
});