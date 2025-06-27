import React from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export default function DebugTools() {
  const checkLocalHS = async () => {
    const hs = await AsyncStorage.getItem('localHighScore');
    console.log('🔍 localHighScore =', hs);
  };

  const setFakeHS = async () => {
    await AsyncStorage.setItem('localHighScore', '131');
    console.log('✅ Set localHighScore to 131');
  };

  const clearHS = async () => {
    await AsyncStorage.removeItem('localHighScore');
    console.log('🗑️ Cleared localHighScore');
  };

  async function tryManualSync(userId: string) {
  const localHS = Number(await AsyncStorage.getItem('localHighScore')) || 0;
  console.log('🔄 Forcing sync, localHS =', localHS);

  const { error } = await supabase.rpc('upsert_high_score', {
    p_user: userId,
    p_score: localHS,
  });

  if (error) {
    console.warn('❌ Sync error:', error);
  } else {
    console.log('✅ Sync successful');
    await AsyncStorage.removeItem('localHighScore');
  }
}

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Debug Tools</Text>
      <Button title="Check localHighScore" onPress={checkLocalHS} />
      <View style={{ height: 10 }} />
      <Button title="Set localHighScore" onPress={setFakeHS} />
      <View style={{ height: 10 }} />
      <Button title="Clear localHighScore" onPress={clearHS} />
      <View style={{ height: 10 }} />
      <Button title="Force Sync" onPress={() => tryManualSync('cd98b8f0-5b46-4fe3-9ebf-c3d23034282a')} />
    </View>
  );
}