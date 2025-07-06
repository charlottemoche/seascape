import { useState, useRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Image, useColorScheme } from 'react-native';
import { View, Text } from '@/components/Themed';
import { fetchFeelings } from '@/lib/feelingsService';
import { useFocusEffect } from '@react-navigation/native';
import { getMoodByDay, MoodDay } from '@/lib/aggregateFeelings';
import type { JournalEntryRaw, JournalEntryDecrypted } from '@/types/Journal';
import FeelingsCalendar from '@/components/Feelings/FeelingsCalendar';
import Colors from '@/constants/Colors';
import CryptoJS from 'crypto-js';

const feelingCategories = {
  positive: ['Happy', 'Pleasant', 'Joyful', 'Excited', 'Grateful', 'Hopeful', 'Content'],
  neutral: ['Calm', 'Indifferent', 'Tired'],
  negative: ['Sad', 'Frustrated', 'Anxious', 'Angry', 'Stressed', 'Lonely'],
};

export default function FeelingsSummary({ userId }: { userId: string }) {
  const [range, setRange] = useState<'1W' | '1M'>('1W');
  const [entries, setEntries] = useState<JournalEntryDecrypted[]>([]);
  const [totals, setTotals] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [mostCommonFeeling, setMostCommonFeeling] = useState('');
  const [dominantMood, setDominantMood] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [error, setError] = useState<string | null>(null);
  const [moodDays, setMoodDays] = useState<MoodDay[]>([]);
  const [percentages, setPercentages] = useState({ positive: 0, neutral: 0, negative: 0 });

  const colorScheme = useColorScheme();

  const backgroundColorBox = colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.card : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#444';

  const showCalendar = ['1M'].includes(range);

  const cacheRef = useRef<Record<string, {
    entries: JournalEntryDecrypted[],
    totals: typeof totals,
    mostCommonFeeling: string,
    dominantMood: 'positive' | 'neutral' | 'negative',
    moodDays: MoodDay[]
  }>>({});

  function getEncryptionKey(userId: string): string {
    return CryptoJS.SHA256(userId).toString();
  }

  function decryptText(ciphertext: string, userId: string): string {
    const key = getEncryptionKey(userId);
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  }

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function imageForMood(category: string) {
    if (category === 'positive') return require('@/assets/images/sun.png');
    if (category === 'neutral') return require('@/assets/images/moon.png');
    return require('@/assets/images/rain.png');
  }

  const load = useCallback(async () => {
    const key = `${userId}-${range}`;
    if (cacheRef.current[key]) {
      const cached = cacheRef.current[key];
      setEntries(cached.entries);
      setMoodDays(cached.moodDays);
      setTotals(cached.totals);
      setMostCommonFeeling(cached.mostCommonFeeling);
      setDominantMood(cached.dominantMood);
      setError(null);
      return;
    }

    setError(null);

    try {
      const rawData: JournalEntryRaw[] = await fetchFeelings(userId, range);

      const decryptedData: JournalEntryDecrypted[] = rawData.map((entry) => {
        let feelingsArray: string[] = [];
        if (entry.feeling) {
          const decrypted = decryptText(entry.feeling, userId);
          try {
            feelingsArray = JSON.parse(decrypted);
          } catch {
            feelingsArray = [];
          }
        }
        return {
          created_at: entry.created_at,
          feeling: feelingsArray,
        };
      });

      const moodDays = getMoodByDay(decryptedData);

      const totals = moodDays.reduce(
        (acc, d) => {
          acc.positive += d.counts.positive;
          acc.neutral += d.counts.neutral;
          acc.negative += d.counts.negative;
          return acc;
        },
        { positive: 0, neutral: 0, negative: 0 }
      );

      const allFeelings = decryptedData.flatMap((entry) => entry.feeling);
      const frequency = allFeelings.reduce((acc, f) => {
        acc[f] = (acc[f] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topFeeling = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

      let dominant: 'positive' | 'neutral' | 'negative' = 'neutral';

      const { positive, neutral, negative } = totals;
      const maxCount = Math.max(positive, neutral, negative);

      const maxCategories = [
        positive === maxCount ? 'positive' : null,
        neutral === maxCount ? 'neutral' : null,
        negative === maxCount ? 'negative' : null,
      ].filter(Boolean) as ('positive' | 'neutral' | 'negative')[];

      if (maxCategories.length === 1) {
        dominant = maxCategories[0];
      } else if (maxCategories.length > 1) {
        if (maxCategories.includes('positive')) {
          dominant = 'positive';
        } else if (maxCategories.includes('neutral')) {
          dominant = 'neutral';
        } else {
          dominant = 'negative';
        }
      }

      if (topFeeling) {
        for (const category in feelingCategories) {
          if (feelingCategories[category as keyof typeof feelingCategories].includes(topFeeling)) {
            if (maxCategories.includes(category as 'positive' | 'neutral' | 'negative')) {
              dominant = category as 'positive' | 'neutral' | 'negative';
            }
            break;
          }
        }
      }

      if (range === '1M') {
        const totalFeelings = Object.values(totals).reduce((acc, val) => acc + val, 0);
        const percentages = Object.entries(totals).reduce((acc, [category, count]) => {
          acc[category as keyof typeof totals] = (count / totalFeelings) * 100;
          return acc;
        }, {} as typeof totals);
        setPercentages(percentages);
      }

      cacheRef.current[key] = {
        entries: decryptedData,
        totals: totals,
        mostCommonFeeling: topFeeling,
        dominantMood: dominant,
        moodDays: moodDays,
      };

      setEntries(decryptedData);
      setMoodDays(moodDays);
      setTotals(totals);
      setMostCommonFeeling(topFeeling);
      setDominantMood(dominant);
      setError(null);
    } catch (err) {
      console.error('[FeelingsSummary] fetch error:', err);
      setError('Failed to load feelings data.');
    }
  }, [userId, range]);

  const showNeutralImage = error || entries.length === 0;
  const summaryText = error
    ? error
    : 'Log some journal entries to track your mood.';

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View>
      <View style={styles.container}>
        <View style={[styles.ranges, { backgroundColor: backgroundColor }]}>
          {(['1W', '1M'] as const).map((r) => (
            <Pressable key={r} onPress={() => setRange(r)} style={[styles.range, range === r && styles.selectedRange]}>
              <Text style={{
                fontWeight: range === r ? 'bold' : 'normal',
                color: range === r ? '#000' : colorScheme === 'dark' ? '#fff' : '#000',
              }}>{r}</Text>
            </Pressable>
          ))}
        </View>

        {range === '1M' ? (
          <View style={[styles.wrapper, { backgroundColor: backgroundColor, paddingHorizontal: 16, paddingBottom: 16 }]}>
            <FeelingsCalendar data={moodDays} percentages={percentages} />
          </View>
        ) : (
          <View style={styles.wrapper}>
            <View style={styles.imageContainer}>
              <Image
                source={imageForMood(showNeutralImage ? 'neutral' : dominantMood)}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <View style={[styles.summaryBox, { backgroundColor: backgroundColorBox }]}>
              {showNeutralImage ? (
                <Text style={[styles.noEntries, { color: textColor }]}>
                  {summaryText}
                </Text>
              ) : (
                <>
                  <Text style={styles.label}>
                    Your overall mood for the past {range === '1W' ? 'week' : 'month'} was
                  </Text>
                  <Text style={styles.mood}>{capitalize(dominantMood)}</Text>
                  <Text style={styles.common}>
                    Most frequent feeling: {mostCommonFeeling}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderColor: 'rgba(123, 182, 212, 0.4)',
    borderWidth: 1,
  },
  ranges: {
    flexDirection: 'row',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  range: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedRange: {
    backgroundColor: '#7bb6d4',
    borderColor: '#7bb6d4',
  },
  wrapper: {
    width: '100%',
    position: 'relative',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 6 / 5,
    alignSelf: 'flex-start',
  },
  summaryBox: {
    position: 'absolute',
    bottom: 16,
    width: '90%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: '5%',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  mood: {
    fontSize: 22,
    fontWeight: 500,
    textAlign: 'center',
  },
  common: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  noEntries: {
    fontSize: 14,
    textAlign: 'center',
  },
  bar: {
    height: 8,
    width: '90%',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 12,
  },
  keyDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginBottom: 4,
  },
  keysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  keyContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});