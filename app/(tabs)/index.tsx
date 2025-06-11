import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/Tabs/TabBar';
import { useUserStats } from '@/components/hooks/user/useUserStats';
import { ActivityIndicator } from 'react-native';
import { useRequireAuth } from '@/components/hooks/user/useRequireAuth';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const {
    journalStreak,
    breathStreak,
    totalMinutes,
    loading: statsLoading,
  } = useUserStats(user?.id ?? null);

  if (loading || statsLoading || !user) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#cfe9f1" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.background}>
      <View style={[styles.card, styles.darkCard]}>
        <Text style={styles.streakTitle}>Mindfulness Streaks</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <View style={styles.iconWrapper}>
              <TabBarIcon name="pencil" color={Colors.custom.red} type="SimpleLineIcons" size={20} />
            </View>
            <Text style={styles.streakSubtitle}>Journaling</Text>
            <Text style={styles.cardDataStreaks}>
              {journalStreak !== null && journalStreak > 0 ? `${journalStreak} days` : 'No data'}
            </Text>
          </View>
          <View style={styles.streakItem}>
            <View style={styles.iconWrapper}>
              <TabBarIcon name="leaf-outline" color={Colors.custom.green} type="Ionicons" size={20} />
            </View>
            <Text style={styles.streakSubtitle}>Breathing</Text>
            <Text style={styles.cardDataStreaks}>
              {breathStreak !== null && breathStreak > 0 ? `${breathStreak} days` : 'No data'}
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
            <Text style={styles.streakSubtitle}>Minutes</Text>
            <Text style={styles.cardDataStreaks}>
              {totalMinutes !== null ? `${totalMinutes} minutes` : 'No minutes logged yet'}
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
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.custom.background,
    padding: 24,
  },
  overlay: {
    backgroundColor: Colors.custom.background,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
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
    fontSize: 18,
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
    fontSize: 20,
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