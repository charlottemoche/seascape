import React, { useState } from 'react';
import { Alert, StyleSheet, useColorScheme } from 'react-native';
import { View, Text, Button, Input } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import { sendFriendRequest } from '@/lib/friendService';
import Colors from '@/constants/Colors';

export default function AddByCode() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const colorScheme = useColorScheme();
  const greyBorder = colorScheme === 'dark' ? '#808080' : Colors.custom.grey;

  async function handleAdd() {
    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z]{3}-\d{4}$/.test(trimmed)) {
      Alert.alert('Invalid code format');
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('friend_code', trimmed)
        .single();

      if (error) throw error;
      await sendFriendRequest(data!.user_id);
      Alert.alert('Success', 'Request sent.');
      setCode('');
    } catch (e: any) {
      console.error('[addFriend] failed:', e);
      if (e.code === 'PGRST116') {
        Alert.alert('Error', 'Could not find a user with that code.');
      } else if (e.message?.includes('Friend request sent or already friends.')) {
        Alert.alert('Error', 'Friend request sent or already friends.');
      } else {
        Alert.alert('Error', 'Could not send friend request.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Input
        value={code}
        onChangeText={setCode}
        placeholder="ABC-1234"
        autoCapitalize="characters"
        placeholderTextColor='#888'
        style={{ borderColor: greyBorder }}
      />
      <Button title="Add" onPress={handleAdd} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});