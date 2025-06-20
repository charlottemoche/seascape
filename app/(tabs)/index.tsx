import { StyleSheet, ScrollView, SafeAreaView, useColorScheme, Image, RefreshControl } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useProfile } from '@/context/ProfileContext';
import { useStreaks } from '@/context/StreakContext';
import { View, Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { FishColor } from '@/constants/fishMap';
import { useFocusEffect } from '@react-navigation/native';
import fishImages from '@/constants/fishMap';
import FeelingsSummary from '@/components/FeelingsSummary';
import Colors from '@/constants/Colors';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function HomeScreen() {
  const { user, loading } = useRequireAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { breathStreak, journalStreak, streaksLoading, refreshStreaks } = useStreaks();
    
  const [refreshing, setRefreshing] = useState(false);
  
  const lastRefresh = useRef(0);

  const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? Colors.custom.dark : '#f8f8f8';

  const loaderColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.lightBlue;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshStreaks();
    setRefreshing(false);
  }, [refreshStreaks]);

  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      if (now - lastRefresh.current > REFRESH_INTERVAL_MS) {
        refreshStreaks();
        lastRefresh.current = now;
      }
    }, [refreshStreaks])
  );

  if (loading || profileLoading || streaksLoading || !user || !profile) {
    return (
      <Loader />
    );
  }

  function formatTime(totalMinutes: number) {
    if (totalMinutes < 60) {
      return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes === 0
        ? `${hours} hour${hours === 1 ? '' : 's'}`
        : `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
  }

  const { total_minutes } = profile;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <ScrollView
        contentContainerStyle={[styles.background, { backgroundColor: backgroundColor }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[loaderColor]}
            tintColor={loaderColor}
          />
        }>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Your personal stats</Text>
        <View style={styles.colorOptions}>
          {availableColors.map((color) => (
            <Image source={fishImages[color]} key={color} style={styles.smallFish} />
          ))}
        </View>
        <View style={[styles.card, styles.darkCard]}>
          <Text style={styles.streakTitle}>Mindfulness Streaks</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <View style={styles.iconWrapper}>
                <TabBarIcon name="pencil" color={Colors.custom.red} type="SimpleLineIcons" size={18} />
              </View>
              <Text style={styles.streakSubtitle}>Journaling</Text>
              <Text testID="journal-streak" style={styles.cardDataStreaks}>
                {typeof journalStreak === 'number'
                  ? `${journalStreak} day${journalStreak === 1 ? '' : 's'}`
                  : 'No data'}
              </Text>
            </View>
            <View style={styles.streakItem}>
              <View style={styles.iconWrapper}>
                <TabBarIcon name="leaf-outline" color={Colors.custom.green} type="Ionicons" size={18} />
              </View>
              <Text style={styles.streakSubtitle}>Breathing</Text>
              <Text testID="breathing-streak" style={styles.cardDataStreaks}>
                {typeof breathStreak === 'number'
                  ? `${breathStreak} day${breathStreak === 1 ? '' : 's'}`
                  : 'No data'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.darkCard]}>
          <Text style={styles.streakTitle}>Total Time Meditated</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <View style={styles.iconWrapper}>
                <TabBarIcon name="clock" color={Colors.custom.blue} type="SimpleLineIcons" size={20} />
              </View>
              <Text style={styles.streakSubtitle}>Time</Text>
              <Text style={styles.cardDataStreaks}>
                {typeof total_minutes === 'number' && total_minutes > 0
                  ? formatTime(total_minutes)
                  : 'No time logged yet'}
              </Text>
            </View>
          </View>
        </View>

        <FeelingsSummary userId={user.id} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flexGrow: 1,
    padding: 20,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  smallFish: {
    width: 30,
    height: 30,
  },
  loading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 30,
  },
  darkCard: {
    borderWidth: 1,
    borderColor: 'rgba(123, 182, 212, 0.5)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 16,
  },
  cardData: {
    fontSize: 16,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  streakSubtitle: {
    fontSize: 14,
    marginTop: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 2,
  },
  cardDataStreaks: {
    fontSize: 16,
    paddingTop: 4,
    marginTop: 8,
  },
  cardLink: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 8,
  },
});