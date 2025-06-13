import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import { ActivityIndicator } from 'react-native';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useProfile } from '@/context/ProfileContext';
import Colors from '@/constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function HomeScreen() {
  const { user, loading } = useRequireAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshProfile({ silent: true });
    }, [])
  );

  if (loading || profileLoading || !user || !profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.custom.lightBlue} />
      </View>
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

  const { journal_streak, breath_streak, total_minutes } = profile;

  return (
    <ScrollView contentContainerStyle={styles.background}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Your personal stats</Text>
      <View style={[styles.card, styles.darkCard]}>
        <Text style={styles.streakTitle}>Mindfulness Streaks</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <View style={styles.iconWrapper}>
              <TabBarIcon name="pencil" color={Colors.custom.red} type="SimpleLineIcons" size={20} />
            </View>
            <Text style={styles.streakSubtitle}>Journaling</Text>
            <Text style={styles.cardDataStreaks}>
              {typeof journal_streak === 'number'
                ? `${journal_streak} day${journal_streak === 1 ? '' : 's'}`
                : 'No data'}
            </Text>
          </View>
          <View style={styles.streakItem}>
            <View style={styles.iconWrapper}>
              <TabBarIcon name="leaf-outline" color={Colors.custom.green} type="Ionicons" size={20} />
            </View>
            <Text style={styles.streakSubtitle}>Breathing</Text>
            <Text style={styles.cardDataStreaks}>
              {typeof breath_streak === 'number'
                ? `${breath_streak} day${breath_streak === 1 ? '' : 's'}`
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

      <View style={[styles.card, styles.actionCard]}>
        <Pressable onPress={() => router.push('/journal')}>
          <View style={styles.actionHeader}>
            <TabBarIcon type="SimpleLineIcons" name="pencil" color={Colors.custom.red} size={18} />
            <Text style={styles.cardTitle}>How are you feeling?</Text>
          </View>
          <Text style={styles.cardSubtitle}>Choose an emotion or write a journal entry.</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.actionCard]}>
        <Pressable onPress={() => router.push('/breathe')}>
          <View style={styles.actionHeader}>
            <TabBarIcon type="Ionicons" name="leaf-outline" color={Colors.custom.green} size={20} />
            <Text style={styles.cardTitle}>Need a moment?</Text>
          </View>
          <Text style={styles.cardSubtitle}>Try a quick breathing meditation to relax.</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flexGrow: 1,
    backgroundColor: Colors.custom.background,
    padding: 20,
  },
  loading: {
    backgroundColor: Colors.custom.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  darkCard: {
    backgroundColor: 'rgba(207, 233, 241, 0.1)'
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 16,
    color: Colors.custom.lightBlue,
  },
  cardData: {
    fontSize: 16,
    color: Colors.custom.lightBlue,
  },
  streakTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  streakSubtitle: {
    fontSize: 14,
    color: Colors.custom.lightBlue,
    marginTop: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.custom.lightBlue,
    paddingBottom: 2,
  },
  cardDataStreaks: {
    fontSize: 16,
    color: Colors.custom.lightBlue,
    paddingTop: 4,
    marginTop: 8,
  },
  cardLink: {
    fontSize: 16,
    color: Colors.custom.lightBlue,
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
  actionCard: {
    borderLeftWidth: 5,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#7bb6d4',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
});