import { StyleSheet, ScrollView, SafeAreaView, useColorScheme, Pressable } from 'react-native';
import React, { useRef, useCallback } from 'react';
import { Icon } from '@/components/Icon';
import { useStreaks } from '@/context/StreakContext';
import { View, Text, Button } from '@/components/Themed';
import { FishColor } from '@/constants/fishMap';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useGuestBreath } from '@/hooks/useGuestBreath';
import { FadeImage } from '@/components/FadeImage';
import { Loader } from '@/components/Loader';
import fishImages from '@/constants/fishMap';
import FeelingsSummary from '@/components/Feelings/FeelingsSummary';
import FeelingsPlaceholder from '@/components/Feelings/FeelingsPlaceholder';
import Colors from '@/constants/Colors';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function HomeScreen() {
  const { user, profile } = useSession();
  const { breathStreak, journalStreak, refreshStreaks, streaksLoading } = useStreaks();
  const { totalMinutes } = useGuestBreath();

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

  const isLoggedIn = !!user;

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

  if (streaksLoading) return <Loader />;

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Your personal stats</Text>
          <View style={styles.colorOptions}>
            {availableColors.map(color => (
              <FadeImage
                key={color}
                source={fishImages[color]}
                style={styles.smallFish}
                placeholderColor={colorScheme === 'dark' ? '#444' : '#eee'}
                resizeMode="contain"
              />
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
                  {isLoggedIn && (
                    <Text testID="journal-streak" style={styles.cardDataStreaks}>
                      {typeof journalStreak === 'number'
                        ? `${journalStreak} day${journalStreak === 1 ? '' : 's'}`
                        : 'No data'}
                    </Text>
                  )}
                </View>
              </Pressable>
              <Pressable onPress={() => router.push('/breathe')} style={[styles.streakItem, { backgroundColor: cardColor }]}>
                <View style={[styles.streakItem, { backgroundColor: cardColor }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: cardColor }]}>
                    <Icon name="leaf-outline" color={Colors.custom.green} type="Ionicons" size={20} />
                  </View>
                  <Text style={[styles.streakSubtitle, { borderBottomColor: greyBorder }]}>Breathing</Text>
                  {isLoggedIn && (
                    <Text testID="breathing-streak" style={styles.cardDataStreaks}>
                      {typeof breathStreak === 'number'
                        ? `${breathStreak} day${breathStreak === 1 ? '' : 's'}`
                        : 'No data'}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
            {!isLoggedIn && (
              <View style={[styles.streakItem, { backgroundColor: cardColor }]}>
                <Button title="Log in to track" onPress={() => router.push('/login')} style={{ marginTop: 20 }} />
              </View>
            )}
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
                  {isLoggedIn ? (
                    typeof profile?.total_minutes === 'number' && profile.total_minutes > 0
                      ? formatTime(profile.total_minutes)
                      : 'No time logged yet'
                  ) : (
                    Number(totalMinutes) > 0 ? formatTime(Number(totalMinutes)) : 'No time logged yet'
                  )}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.feelingsWrapper}>
            <View style={{ maxWidth: 500 }}>
              {user ? <FeelingsSummary userId={user.id} /> : <FeelingsPlaceholder />}
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
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: 500,
  },
  cardSubtitle: {
    fontSize: 15,
  },
  cardData: {
    fontSize: 15,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 500,
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
    fontSize: 15,
    paddingTop: 4,
    marginTop: 8,
  },
  cardLink: {
    fontSize: 15,
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