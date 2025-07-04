import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import {
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  endOfToday,
  subDays,
  isSameDay,
} from 'date-fns';
import type { MoodDay } from '@/lib/aggregateFeelings';
import Colors from '@/constants/Colors';

type Props = {
  data: MoodDay[];
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function FeelingsCalendar({ data }: Props) {
  const colorScheme = useColorScheme();

  const textColor = colorScheme === 'dark' ? Colors.custom.white : Colors.custom.darkGrey;
  const backgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  const todayColor = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.lightBlue;
  const todayText = colorScheme === 'dark' ? Colors.custom.dark : Colors.custom.dark;

  const countsMap = new Map(data.map(d => [d.date, d.counts]));

  const today = endOfToday();
  const windowStart = subDays(today, 29);
  const calendarStart = startOfWeek(windowStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(today, { weekStartsOn: 0 });


  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const colorFor = (mood: MoodDay['mood']) => {
    switch (mood) {
      case 'positive': return Colors.custom.blue;
      case 'neutral': return Colors.custom.green;
      case 'negative': return Colors.custom.red;
      default: return 'transparent';
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { paddingBottom: 10, color: textColor }]}>Past 30 days</Text>
      </View>
      <View style={styles.headerRow}>
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={[styles.headerText, { color: textColor }]}>{d}</Text>
        ))}
      </View>

      {weeks.map((week, idx) => (
        <View key={idx} style={styles.weekRow}>
          {week.map(date => {
            const key = format(date, 'yyyy-MM-dd');
            const counts = countsMap.get(key);
            const isInWindow = date >= windowStart && date <= today;
            const isToday = isSameDay(date, today);

            return (
              <View
                key={key}
                style={[
                  styles.dayBox,
                  {
                    backgroundColor: 'transparent',
                    opacity: isInWindow ? 1 : 0,
                    borderColor: '#ccc',
                  },
                ]}
              >
                {isInWindow && counts && (
                  <View style={styles.dotRow}>
                    {counts.positive > 0 && (
                      <View style={[styles.dot, { backgroundColor: Colors.custom.blue }]} />
                    )}
                    {counts.neutral > 0 && (
                      <View style={[styles.dot, { backgroundColor: Colors.custom.green }]} />
                    )}
                    {counts.negative > 0 && (
                      <View style={[styles.dot, { backgroundColor: Colors.custom.red }]} />
                    )}
                  </View>
                )}
                <Text style={[
                  styles.dateLabel,
                  {
                    color: isToday ? todayText : textColor,
                    backgroundColor: isToday ? todayColor : backgroundColor
                  }
                ]}>
                  {format(date, 'M/d')}
                </Text>
              </View>
            );
          })}

        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    margin: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: 500,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    padding: 1,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 5,
  },
});