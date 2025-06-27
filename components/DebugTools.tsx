import React from 'react';
import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function DebugTools() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="⇢ jump to Requests"
        onPress={() => {
          console.log('[DEV] pushing → /profile?tab=requests');
          router.push({ pathname: '/profile', params: { tab: 'requests' } });
        }}
      />
    </View>
  );
}