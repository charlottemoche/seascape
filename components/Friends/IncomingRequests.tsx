import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, useColorScheme } from 'react-native';
import { View, Text, Button } from '@/components/Themed';
import { listIncomingRequests, acceptFriendRequest, IncomingRequest } from '@/lib/friendService';
import Friend from './Friend';
import Colors from '@/constants/Colors';

export default function IncomingRequests({ onAccepted }: { onAccepted: () => void }) {
  const [rows, setRows] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();

  const textColor = colorScheme === 'dark' ? '#eee' : '#222';

  async function refresh() {
    setLoading(true);
    try {
      setRows(await listIncomingRequests());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleAccept(requesterId: string) {
    try {
      await acceptFriendRequest(requesterId);
      Alert.alert('Success', 'Friend added!');
      onAccepted();
      setRows((prev) => prev.filter((r) => r.requesterId !== requesterId));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  if (loading) return <ActivityIndicator style={{ padding: 4 }} />;

  if (!rows.length)
    return <Text style={[styles.empty, { color: textColor }]}>No friend requests</Text>;

  return (
    <View style={{ backgroundColor: 'transparent', flexShrink: 1 }}>
      {rows.map((item) => (
        <View style={styles.row} key={item.id}>
          <View style={{ flexShrink: 1, backgroundColor: 'transparent' }}>
            <Friend
              fish_name={item.fish_name}
              friend_code={item.friend_code}
              fish_color={item.fish_color}
            />
          </View>
          <Button
            title="Accept"
            onPress={() => handleAccept(item.requesterId)}
          />
        </View>

      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    fontWeight: 500,
    marginTop: 4,
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
});