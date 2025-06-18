import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button, Text, Input } from '@/components/Themed';
import { Eye, EyeOff } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      const url = await Linking.getInitialURL();
      if (!url) return;

      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) return;

      const hash = url.slice(hashIndex + 1);
      const params = new URLSearchParams(hash);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    };

    restoreSession();
  }, []);

  const handleReset = async () => {
    if (!password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in both fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace({ pathname: '/login', params: { reset: 'true' } });
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.label}>Enter your new password</Text>
        <View>
          <Input
            placeholder='Password'
            autoComplete='password'
            placeholderTextColor='#888'
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
            style={{ paddingRight: 40 }}
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eye}
          >
            {showPassword ? <EyeOff size={20} color='#888' /> : <Eye size={20} color='#888' />}
          </Pressable>
        </View>
        <View>
          <Input
            placeholder='Confirm password'
            autoComplete='password'
            placeholderTextColor='#888'
            secureTextEntry={!showConfirmedPassword}
            onChangeText={setConfirm}
            value={confirm}
            style={{ paddingRight: 40 }}
          />
          <Pressable
            onPress={() => setShowConfirmedPassword((prev) => !prev)}
            style={styles.eye}
          >
            {showConfirmedPassword ? <EyeOff size={20} color='#888' /> : <Eye size={20} color='#888' />}
          </Pressable>
          <Button
            title="Reset Password"
            onPress={handleReset}
            disabled={loading}
            loading={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  label: {
    marginBottom: 12,
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
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