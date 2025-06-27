import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { View, Text } from '@/components/Themed';
import { listFriends, FriendRow } from '@/lib/friendService';
import Friend from './Friend';

export default function FriendsList({ refreshSignal }: { refreshSignal: number }) {
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async (force = false) => {
    if (rows.length && !force) return;
    setLoading(true);
    try {
      setRows(await listFriends({ force }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(true); }, [refreshSignal]);

  useEffect(() => { refresh(); }, []);

  const colorScheme = useColorScheme();

  const textColor = colorScheme === 'dark' ? '#eee' : '#222';

  if (loading) return <ActivityIndicator style={{ padding: 4 }} />;

  if (!rows.length)
    return <Text style={[styles.empty, { color: textColor }]}>No friends yet</Text>;

  return (
    <View style={styles.container}>
      {rows.map((f, i) => (
        <View
          key={f.id}
          style={styles.row}
        >
          <Friend
            fish_name={f.fish_name}
            friend_code={f.friend_code}
            fish_color={f.fish_color}
            high_score={f.high_score}
            labeled
            smallText
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
    fontSize: 20,
    fontWeight: 600
  },
  container: {
    backgroundColor: 'transparent',
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
});