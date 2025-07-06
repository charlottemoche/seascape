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
  percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function FeelingsCalendar({ data, percentages }: Props) {
  const colorScheme = useColorScheme();

  const textColor = colorScheme === 'dark' ? Colors.custom.white : Colors.custom.darkGrey;
  const headerColor = colorScheme === 'dark' ? Colors.custom.white : Colors.custom.dark;
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { paddingBottom: 10, color: headerColor }]}>Past 30 days</Text>
      </View>
      <View style={[styles.headerRow, { borderBottomColor: textColor, borderBottomWidth: 0.5, paddingBottom: 6 }]}>
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
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.custom.blue }]} />
          <Text style={[styles.legendLabel, { color: textColor }]}>Positive</Text>
          <Text style={[styles.legendPercent, { color: textColor }]}>
            {percentages.positive.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.custom.green }]} />
          <Text style={[styles.legendLabel, { color: textColor }]}>Neutral</Text>
          <Text style={[styles.legendPercent, { color: textColor }]}>
            {percentages.neutral.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.custom.red }]} />
          <Text style={[styles.legendLabel, { color: textColor }]}>Negative</Text>
          <Text style={[styles.legendPercent, { color: textColor }]}>
            {percentages.negative.toFixed(1)}%
          </Text>
        </View>
      </View>
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
    width: 7,
    height: 7,
    borderRadius: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'nowrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: 500,
    marginLeft: 4,
  },
  legendPercent: {
    fontSize: 13,
    marginLeft: 4,
  },
});