import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { View, Text } from '@/components/Themed';
import { listFriends, FriendRow } from '@/lib/friendService';
import Friend from './Friend';
import Colors from '@/constants/Colors';

type Props = {
  refreshSignal: number;
};

export default function FriendsList({ refreshSignal }: Props) {
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
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;

  if (loading) return <ActivityIndicator style={{ padding: 4 }} />;

  if (!rows.length)
    return <Text style={[styles.empty, { color: textColor }]}>No friends yet</Text>;

  return (
    <>
      <View style={[styles.friendsLabelRow, { borderBottomColor: greyBorder }]}>
        <Text style={styles.sectionTitle}>
          Friend
        </Text>
        <Text style={styles.sectionTitle}>
          High Score
        </Text>
      </View>
      <View style={styles.container}>
        {rows.map((f, i) => (
          <View
            key={f.id}
            style={[
              styles.row,
              i !== rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: greyBorder },
            ]}
          >
            <Friend
              fish_name={f.fish_name}
              friend_code={f.friend_code}
              fish_color={f.fish_color}
              high_score={f.high_score}
              receiverId={f.friendId}
              showFullDetails
              smallText
            />
          </View>
        ))}
      </View>
    </>
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
  friendsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 12,
    textAlign: 'center',
  },
});