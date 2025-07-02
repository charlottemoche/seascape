import { useState, useRef, useCallback } from 'react';
import { Pressable, StyleSheet, Image, useColorScheme, ActivityIndicator } from 'react-native';
import { View, Text } from '@/components/Themed';
import { fetchFeelings } from '@/lib/feelingsService';
import { useFocusEffect } from '@react-navigation/native';
import type { JournalEntryRaw, JournalEntryDecrypted } from '@/types/Journal';
import Colors from '@/constants/Colors';
import CryptoJS from 'crypto-js';

const feelingCategories = {
  positive: ['Happy', 'Pleasant', 'Joyful', 'Excited', 'Grateful', 'Hopeful', 'Content'],
  neutral: ['Calm', 'Indifferent', 'Tired'],
  negative: ['Sad', 'Frustrated', 'Anxious', 'Angry', 'Stressed', 'Lonely'],
};

export default function FeelingsSummary({ userId }: { userId: string }) {
  const [range, setRange] = useState<'1W' | '1M' | '3M' | '6M'>('1W');
  const [entries, setEntries] = useState<JournalEntryDecrypted[]>([]);
  const [totals, setTotals] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [mostCommonFeeling, setMostCommonFeeling] = useState('');
  const [dominantMood, setDominantMood] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();

  const backgroundColorBox = colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.card : '#fff';
  const loaderBackgroundColor = colorScheme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
  const textColor = colorScheme === 'dark' ? '#fff' : '#444';
  const greyTextColor = colorScheme === 'dark' ? '#fefefe' : '#444';

  const cacheRef = useRef<Record<string, {
    entries: JournalEntryDecrypted[],
    totals: typeof totals,
    mostCommonFeeling: string,
    dominantMood: 'positive' | 'neutral' | 'negative'
  }>>({});

  const percent = (value: number) => Math.round((value / (totals.positive + totals.neutral + totals.negative)) * 100);

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
      setTotals(cached.totals);
      setMostCommonFeeling(cached.mostCommonFeeling);
      setDominantMood(cached.dominantMood);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
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

      const grouped = decryptedData.reduce((acc, entry) => {
        const day = { positive: 0, neutral: 0, negative: 0 };
        for (const f of entry.feeling) {
          if (feelingCategories.positive.includes(f)) day.positive++;
          else if (feelingCategories.neutral.includes(f)) day.neutral++;
          else if (feelingCategories.negative.includes(f)) day.negative++;
        }
        acc[entry.created_at] = day;
        return acc;
      }, {} as Record<string, { positive: number; neutral: number; negative: number }>);

      const totalCounts = Object.values(grouped).reduce(
        (acc, day) => {
          acc.positive += day.positive;
          acc.neutral += day.neutral;
          acc.negative += day.negative;
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

      const { positive, neutral, negative } = totalCounts;
      const maxCount = Math.max(positive, neutral, negative);

      const maxCategories = [
        positive === maxCount ? 'positive' : null,
        neutral === maxCount ? 'neutral' : null,
        negative === maxCount ? 'negative' : null,
      ].filter(Boolean) as ('positive' | 'neutral' | 'negative')[];

      if (maxCategories.length === 1) {
        dominant = maxCategories[0];
      } else if (maxCategories.length > 1) {
        // Tie-break priority: positive > neutral > negative
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

      cacheRef.current[key] = {
        entries: decryptedData,
        totals: totalCounts,
        mostCommonFeeling: topFeeling,
        dominantMood: dominant,
      };

      setEntries(decryptedData);
      setTotals(totalCounts);
      setMostCommonFeeling(topFeeling);
      setDominantMood(dominant);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('[FeelingsSummary] fetch error:', err);
      setError('Failed to load feelings data.');
      setLoading(false);
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
      {loading && (
        <View style={[styles.loaderOverlay, { backgroundColor: loaderBackgroundColor }]}>
          <ActivityIndicator size="large" color={Colors.custom.blue} />
        </View>
      )}
      <View style={styles.container}>
        <View style={[styles.ranges, { backgroundColor: backgroundColor }]}>
          {(['1W', '1M', '3M', '6M'] as const).map((r) => (
            <Pressable key={r} onPress={() => setRange(r)} style={[styles.range, range === r && styles.selectedRange]}>
              <Text style={{
                fontWeight: range === r ? 'bold' : 'normal',
                color: range === r ? '#000' : colorScheme === 'dark' ? '#fff' : '#000',
              }}>{r}</Text>
            </Pressable>
          ))}
        </View>

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
                  This {range === '1W' ? 'week' : 'period'}, your overall mood was
                </Text>
                <Text style={styles.mood}>{capitalize(dominantMood)}</Text>
                <Text style={[styles.common, { color: greyTextColor }]}>
                  Most frequent feeling: {mostCommonFeeling}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {entries.length > 0 && (
        <View style={[styles.container, { marginTop: 16, backgroundColor: backgroundColor }]}>
          <View style={styles.bar}>
            <View style={{ flex: totals.positive, backgroundColor: Colors.custom.blue }} />
            <View style={{ flex: totals.neutral, backgroundColor: Colors.custom.green }} />
            <View style={{ flex: totals.negative, backgroundColor: Colors.custom.red }} />
          </View>

          <View style={[styles.keysContainer, { backgroundColor: backgroundColor }]}>
            <View style={styles.keyContainer}>
              <View style={[styles.keyDot, { backgroundColor: Colors.custom.blue }]} />
              <Text style={styles.common}>
                Positive ({percent(totals.positive)}%)
              </Text>
            </View>
            <View style={styles.keyContainer}>
              <View style={[styles.keyDot, { backgroundColor: Colors.custom.green }]} />
              <Text style={styles.common}>
                Neutral ({percent(totals.neutral)}%)
              </Text>
            </View>
            <View style={styles.keyContainer}>
              <View style={[styles.keyDot, { backgroundColor: Colors.custom.red }]} />
              <Text style={styles.common}>
                Negative ({percent(totals.negative)}%)
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderColor: 'rgba(123, 182, 212, 0.4)',
    borderWidth: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
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