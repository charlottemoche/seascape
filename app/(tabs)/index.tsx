import { StyleSheet, ScrollView, SafeAreaView, useColorScheme, Image, Pressable } from 'react-native';
import React, { useRef, useCallback } from 'react';
import { Icon } from '@/components/Icon';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useProfile } from '@/context/ProfileContext';
import { useStreaks } from '@/context/StreakContext';
import { View, Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { FishColor } from '@/constants/fishMap';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import fishImages from '@/constants/fishMap';
import FeelingsSummary from '@/components/FeelingsSummary';
import Colors from '@/constants/Colors';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function HomeScreen() {
  const { user, loading } = useRequireAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { breathStreak, journalStreak, streaksLoading, refreshStreaks } = useStreaks();

  const router = useRouter();

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  const greyBorder = colorScheme === 'dark' ? Colors.custom.darkGrey : Colors.custom.grey;

  const lastRefresh = useRef(0);

  const availableColors: FishColor[] = ['blue', 'red', 'green', 'purple', 'yellow'];

  useFocusEffect(
    useCallback(() => {
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
    <SafeAreaView style={[styles.wrapper, { backgroundColor: backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Your personal stats</Text>
          <View style={styles.colorOptions}>
            {availableColors.map((color) => (
              <Image source={fishImages[color]} key={color} style={styles.smallFish} />
            ))}
          </View>
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={styles.streakTitle}>Mindfulness Streaks</Text>
            <View style={styles.streakRow}>
              <Pressable onPress={() => router.push('/journal')} style={[styles.streakItem, { backgroundColor: cardColor }]}>
                <View style={[styles.streakItem, { backgroundColor: cardColor }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: cardColor }]}>
                    <Icon name="pencil" color={Colors.custom.red} type="SimpleLineIcons" size={18} />
                  </View>
                  <Text style={[styles.streakSubtitle, { borderBottomColor: greyBorder }]}>Journaling</Text>
                  <Text testID="journal-streak" style={styles.cardDataStreaks}>
                    {typeof journalStreak === 'number'
                      ? `${journalStreak} day${journalStreak === 1 ? '' : 's'}`
                      : 'No data'}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => router.push('/breathe')} style={[styles.streakItem, { backgroundColor: cardColor }]}>
                <View style={[styles.streakItem, { backgroundColor: cardColor }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: cardColor }]}>
                    <Icon name="leaf-outline" color={Colors.custom.green} type="Ionicons" size={20} />
                  </View>
                  <Text style={[styles.streakSubtitle, { borderBottomColor: greyBorder }]}>Breathing</Text>
                  <Text testID="breathing-streak" style={styles.cardDataStreaks}>
                    {typeof breathStreak === 'number'
                      ? `${breathStreak} day${breathStreak === 1 ? '' : 's'}`
                      : 'No data'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={styles.streakTitle}>Total Time Meditated</Text>
            <View style={styles.streakRow}>
              <View style={[styles.streakItem, { backgroundColor: cardColor }]}>
                <View style={styles.iconWrapper}>
                  <Icon name="clock" color={Colors.custom.blue} type="SimpleLineIcons" size={18} />
                </View>
                <Text style={[styles.streakSubtitle, { borderBottomColor: greyBorder }]}>Time</Text>
                <Text style={styles.cardDataStreaks}>
                  {typeof total_minutes === 'number' && total_minutes > 0
                    ? formatTime(total_minutes)
                    : 'No time logged yet'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.feelingsWrapper}>
            <View style={{ maxWidth: 500 }}>
              <FeelingsSummary userId={user.id} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
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
    maxWidth: 500,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 182, 212, 0.4)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  cardSubtitle: {
    fontSize: 16,
  },
  cardData: {
    fontSize: 16,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6,
    textAlign: 'center',
  },
  streakSubtitle: {
    fontSize: 14,
    marginTop: 2,
    borderBottomWidth: 1,
    paddingBottom: 2,
    fontWeight: 500,
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
    marginTop: 12,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 8,
    backgroundColor: 'transparent'
  },
  feelingsWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});