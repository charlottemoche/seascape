import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';

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
      Alert.alert('Success', 'Email verified. Please log in.');
      router.replace('/login');
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.header}>Please check your email for verfication code</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: Colors.custom.lightBlue,
    fontSize: 16,
    paddingBottom: 24,
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
});