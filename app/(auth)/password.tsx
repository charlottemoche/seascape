import { useState } from 'react';
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Pressable,
  View,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button, Text, Input } from '@/components/Themed';
import { Eye, EyeOff } from 'lucide-react-native';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);

  const shiftAnim = useKeyboardShift(60, 300, 150);

  const router = useRouter();

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
      setError(error.message);
    } else {
      router.replace({ pathname: '/login', params: { reset: 'true' } });
    }

    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { transform: [{ translateY: shiftAnim }] }]}>
        <View>
          <Text style={styles.label}>Enter your new password</Text>
          <View style={{ position: 'relative', marginBottom: 16 }}>
            {/* Secure Password Input */}
            <Input
              placeholder='Password'
              autoComplete='password'
              placeholderTextColor='#888'
              secureTextEntry={true}
              onChangeText={setPassword}
              value={password}
              style={[{ paddingRight: 40 }, showPassword ? { height: 0, opacity: 0, position: 'absolute', top: 0 } : {}]}
            />
            {/* Plain Text Password Input */}
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

          <View style={{ position: 'relative', marginBottom: 16 }}>
            {/* Secure Confirm Input */}
            <Input
              placeholder='Confirm password'
              autoComplete='password'
              placeholderTextColor='#888'
              secureTextEntry={true}
              onChangeText={setConfirm}
              value={confirm}
              style={[{ paddingRight: 40 }, showConfirmedPassword ? { height: 0, opacity: 0, position: 'absolute', top: 0 } : {}]}
            />
            {/* Plain Text Confirm Input */}
            <Input
              placeholder='Confirm password'
              autoComplete='password'
              placeholderTextColor='#888'
              secureTextEntry={false}
              autoCapitalize='none'
              autoCorrect={false}
              spellCheck={false}
              onChangeText={setConfirm}
              value={confirm}
              style={[{ paddingRight: 40 }, showConfirmedPassword ? {} : { height: 0, opacity: 0, position: 'absolute', top: 0 }]}
            />

            <Pressable
              onPress={() => setShowConfirmedPassword((prev) => !prev)}
              style={styles.eye}
            >
              {showConfirmedPassword ? <EyeOff size={20} color='#888' /> : <Eye size={20} color='#888' />}
            </Pressable>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              title="Reset Password"
              onPress={handleReset}
              disabled={loading}
              loading={loading}
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
    backgroundColor: 'transparent',
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  label: {
    marginBottom: 12,
    textAlign: 'center',
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
  loading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});