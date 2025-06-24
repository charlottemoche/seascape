import { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Button, Text, Input } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';

export default function ResetRequestScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shiftAnim = useKeyboardShift();

  const router = useRouter();

  const handleResetRequest = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'seascape://password',
    });

    if (error) {
      setError(error.message);
    } else {
      Alert.alert('Email Sent', "Check your inbox (or spam folder, just in case).");
      router.replace('/login');
    }

    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { transform: [{ translateY: shiftAnim }] }]}>
        <View>
          <Text style={styles.label}>Enter your email to reset your password</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            spellCheck={false}
            style={styles.input}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button
            title="Send reset link"
            onPress={handleResetRequest}
            disabled={!email || loading}
            loading={loading}
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
    alignSelf: 'center',
    width: '90%'
  },
  label: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});