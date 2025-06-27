import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { View, Text, Button } from '@/components/Themed';
import { listFriends, FriendRow, clearFriendCache } from '@/lib/friendService';
import Friend from './Friend';
import Colors from '@/constants/Colors';

const PAGE_SIZE = 10;

export default function FriendsList({ refreshSignal }: { refreshSignal: number }) {
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [endReached, setEndReached] = useState(false);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    clearFriendCache();
    const first = await listFriends({ page: 0, limit: PAGE_SIZE, force: true });
    setRows(first);
    setPage(0);
    setEndReached(first.length < PAGE_SIZE);
    setLoading(false);
  }, []);


  const loadMore = useCallback(async () => {
    if (endReached || loading) return;
    setLoading(true);
    const nextPage = page + 1;
    const next = await listFriends({ page: nextPage, limit: PAGE_SIZE });
    if (!next.length || next.length < PAGE_SIZE) setEndReached(true);
    setRows(prev => [...prev, ...next]);
    setPage(nextPage);
    setLoading(false);
  }, [endReached, loading, page]);

  useEffect(() => { loadFirst(); }, []);
  useEffect(() => { loadFirst(); }, [refreshSignal]);

  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const border = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;

  if (loading && !rows.length) return <ActivityIndicator style={{ padding: 8 }} />;

  if (!rows.length)
    return <Text style={[styles.empty, { color: textColor }]}>No friends yet</Text>;

  return (
    <View style={[styles.profileSection, { backgroundColor: cardColor, paddingBottom: !rows.length ? 16 : 0 }]}>
      <View style={[styles.friendsLabelRow, { borderBottomColor: greyBorder }]}>
        <Text style={styles.sectionTitle}>
          Friend
        </Text>
        <Text style={styles.sectionTitle}>
          Nudge
        </Text>
      </View>
      <View style={styles.container}>
        {rows.map((f, i) => (
          <View
            key={f.id}
            style={[
              styles.row,
              i !== rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: border },
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

        {!endReached ? (
          loading ? (
            <ActivityIndicator style={{ paddingVertical: 12 }} />
          ) : (
            <Button title="Load more" onPress={loadMore} variant="secondary" style={styles.loadMoreButton} />
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 30,
    maxWidth: 500,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 182, 212, 0.4)',
  },
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
  },
  friendsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadMoreButton: {
    marginBottom: 20,
  },
});