import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Input } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ResetRequestScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleResetRequest = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'seascape://auth/password',
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
      router.replace('/login');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your email to reset your password</Text>
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Button
        title="Send reset link"
        onPress={handleResetRequest}
        disabled={!email || loading}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { 
    marginBottom: 30,
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
  },
});