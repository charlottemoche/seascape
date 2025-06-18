import React, { useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Input } from '@/components/Themed';
import { Text } from '@/components/Themed';

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={styles.container}>
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
  header: {
    fontSize: 16,
    paddingBottom: 24,
  },
});