import { useState } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Button, Text, Input, View } from '@/components/Themed';
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
      <Animated.View style={[styles.wrapper, { transform: [{ translateY: shiftAnim }] }]}>
        <View style={styles.container}>
          <View style={styles.inner}>
            <Text style={styles.label}>Enter your email to reset your password</Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              spellCheck={false}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
              title="Send reset link"
              onPress={handleResetRequest}
              disabled={!email || loading}
              loading={loading}
            />
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  inner: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  label: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16
  },
  error: {
    color: 'red',
    marginBottom: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});