import { View, Text, ImageBackground, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import waveBackground from '@/assets/images/wave.png';
import { TabBarIcon } from '@/components/Tabs/TabBar';

export default function HomeScreen() {
  const router = useRouter();

  const [totalMinutes, setTotalMinutes] = useState<number | null>(null);
  const [journalStreak, setJournalStreak] = useState<number | null>(null);
  const [breathStreak, setBreathStreak] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) return;

      const { data: streaks, error: streakErr } = await supabase
        .from('streaks')
        .select('type')
        .eq('user_id', user.id);

      if (!streakErr && streaks) {
        const journal = streaks.filter((s) => s.type === 'journal');
        const breath = streaks.filter((s) => s.type === 'breath');
        setJournalStreak(journal.length || 0);
        setBreathStreak(breath.length || 0);
      }

      const { data: breaths, error: breathErr } = await supabase
        .from('breaths')
        .select('duration')
        .eq('user_id', user.id);

      if (!breathErr && breaths) {
        const total = breaths.reduce((sum, row) => sum + row.duration, 0);
        setTotalMinutes(total || 0);
      }
    };

    fetchStats();
  }, []);

  return (
    <ImageBackground source={waveBackground} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to Current</Text>
        <Text style={styles.subtitle}>Your personal mindfulness companion</Text>

        <View style={[styles.card, styles.darkCard]}>
          <Text style={styles.cardTitle}>Mindfulness Streaks</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <View style={styles.iconWrapper}>
                <TabBarIcon name="pencil" color="#cfe9f1" type="SimpleLineIcons" size={20} />
              </View>
              <Text style={styles.cardSubtitle}>Journaling</Text>
              <Text style={styles.cardDataStreaks}>
                {journalStreak !== null && journalStreak > 0 ? `${journalStreak} days` : 'No data'}
              </Text>
            </View>
            <View style={styles.streakItem}>
              <View style={styles.iconWrapper}>
                <TabBarIcon name="leaf-outline" color="#cfe9f1" type="Ionicons" size={20} />
              </View>
              <Text style={styles.cardSubtitle}>Breathing</Text>
              <Text style={styles.cardDataStreaks}>
                {breathStreak !== null && breathStreak > 0 ? `${breathStreak} days` : 'No data'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.darkCard]}>
          <View style={styles.actionHeader}>
            <Text style={styles.cardTitle}>Total Time Meditated</Text>
          </View>
           <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <View style={styles.iconWrapper}>
                <TabBarIcon name="clock" color="#cfe9f1" type="SimpleLineIcons" size={20} />
              </View>
              <Text style={styles.cardSubtitle}>Minutes</Text>
              <Text style={styles.cardDataStreaks}>
                {totalMinutes !== null ? `${totalMinutes} minutes` : 'No minutes logged yet'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.actionCard]}>
          <Pressable onPress={() => router.push('/journal')}>
            <View style={styles.actionHeader}>
              <TabBarIcon type="SimpleLineIcons" name="pencil" color="#cfe9f1" size={18} />
              <Text style={styles.cardTitle}>How are you feeling?</Text>
            </View>
            <Text style={styles.cardSubtitle}>Choose an emotion or write a journal entry.</Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.actionCard]}>
          <Pressable onPress={() => router.push('/breathe')}>
            <View style={styles.actionHeader}>
              <TabBarIcon type="Ionicons" name="leaf-outline" color="#cfe9f1" size={20} />
              <Text style={styles.cardTitle}>Need a moment?</Text>
            </View>
            <Text style={styles.cardSubtitle}>Try a quick breathing exercise to relax.</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 30, 50, 0.6)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#cfe9f1',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  darkCard: {
    backgroundColor: 'rgba(0, 31, 51, 0.9)',
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#cfe9f1',
  },
  cardData: {
    fontSize: 16,
    color: '#cfe9f1',
  },
  cardDataStreaks: {
    fontSize: 16,
    color: '#cfe9f1',
    borderTopWidth: 1,
    borderTopColor: '#cfe9f1',
    paddingTop: 4,
    marginTop: 8,
  },
  cardLink: {
    fontSize: 16,
    color: '#cfe9f1',
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
    borderLeftWidth: 3,
    borderLeftColor: '#cfe9f1',
    backgroundColor: 'rgba(0, 31, 51, 0.3)',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  }
});