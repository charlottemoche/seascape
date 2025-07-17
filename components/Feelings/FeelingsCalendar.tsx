import React from "react";
import { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import {
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  subDays,
  isSameDay,
} from "date-fns";
import type { MoodDay } from "@/lib/aggregateFeelings";
import Colors from "@/constants/Colors";

type Props = {
  data: MoodDay[];
  percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
  mostCommon: string;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function useToday() {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const getToday = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(now);

    const year = parts.find((p) => p.type === "year")?.value ?? "";
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const day = parts.find((p) => p.type === "day")?.value ?? "";

    if (!year || !month || !day) {
      throw new Error("Failed to parse date parts");
    }

    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const [today, setToday] = useState(getToday);

  useEffect(() => {
    const msUntilMidnight =
      new Date(getToday().getTime() + 24 * 60 * 60 * 1000).getTime() -
      Date.now() +
      1000;

    const id = setTimeout(() => setToday(getToday()), msUntilMidnight);
    return () => clearTimeout(id);
  }, [today]);

  return today;
}

export default function FeelingsCalendar({
  data,
  percentages,
  mostCommon,
}: Props) {
  const colorScheme = useColorScheme();
  const today = useToday();
  const windowStart = useMemo(() => subDays(today, 29), [today]);

  const textColor =
    colorScheme === "dark" ? Colors.custom.white : Colors.custom.darkGrey;
  const headerColor =
    colorScheme === "dark" ? Colors.custom.white : Colors.custom.dark;
  const backgroundColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  const overlayBackground =
    colorScheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.5)";
  const todayColor =
    colorScheme === "dark" ? Colors.custom.blue : Colors.custom.lightBlue;
  const todayText =
    colorScheme === "dark" ? Colors.custom.dark : Colors.custom.dark;
  const greyColor =
    colorScheme === "dark" ? Colors.custom.mediumGrey : Colors.custom.grey;

  const { weeks, countsMap, hasPercentageData } = useMemo(() => {
    const calendarStart = startOfWeek(windowStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(today, { weekStartsOn: 0 });
    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));

    return {
      weeks: w,
      countsMap: new Map(data.map((d) => [d.date, d.counts])),
      hasPercentageData: Object.values(percentages).some((p) => p > 0),
    };
  }, [data, percentages, windowStart, today]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text
          style={[styles.headerText, { paddingBottom: 10, color: headerColor }]}
        >
          Past 30 days
        </Text>
      </View>
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: greyColor,
            borderBottomWidth: 1,
            paddingBottom: 6,
          },
        ]}
      >
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={[styles.headerText, { color: textColor }]}>
            {d}
          </Text>
        ))}
      </View>

      {!hasPercentageData && (
        <View
          style={[styles.noDataOverlay, { backgroundColor: overlayBackground }]}
        >
          <Text style={[styles.noDataText, { color: headerColor }]}>
            No data for the past 30 days
          </Text>
        </View>
      )}

      {weeks.map((week, idx) => (
        <View key={idx} style={styles.weekRow}>
          {week.map((date) => {
            const key = format(date, "yyyy-MM-dd");
            const counts = countsMap.get(key);
            const isInWindow = date >= windowStart && date <= today;
            const isToday = isSameDay(date, today);

            return (
              <View
                key={key}
                style={[
                  styles.dayBox,
                  {
                    backgroundColor: "transparent",
                    opacity: isInWindow ? 1 : 0,
                    borderColor: "#ccc",
                  },
                ]}
              >
                {isInWindow && counts && (
                  <View style={styles.dotRow}>
                    {counts.positive > 0 && (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: Colors.custom.blue },
                        ]}
                      />
                    )}
                    {counts.neutral > 0 && (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: Colors.custom.green },
                        ]}
                      />
                    )}
                    {counts.negative > 0 && (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: Colors.custom.red },
                        ]}
                      />
                    )}
                  </View>
                )}
                <Text
                  style={[
                    styles.dateLabel,
                    {
                      color: isToday ? todayText : textColor,
                      backgroundColor: isToday ? todayColor : backgroundColor,
                    },
                  ]}
                >
                  {format(date, "M/d")}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
      {hasPercentageData && (
        <>
          <View style={[styles.legend, { borderColor: greyColor }]}>
            <View style={[styles.legendItem, { paddingBottom: 4 }]}>
              <Text
                style={{ color: headerColor, fontWeight: 500, fontSize: 13 }}
              >
                Most common feeling:
              </Text>
              <Text
                style={[
                  styles.legendPercent,
                  { color: headerColor, fontSize: 13 },
                ]}
              >
                {mostCommon}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.dot, { backgroundColor: Colors.custom.blue }]}
              />
              <Text style={[styles.legendLabel, { color: textColor }]}>
                Positive
              </Text>
              <Text style={[styles.legendPercent, { color: textColor }]}>
                {percentages.positive.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.dot, { backgroundColor: Colors.custom.green }]}
              />
              <Text style={[styles.legendLabel, { color: textColor }]}>
                Neutral
              </Text>
              <Text style={[styles.legendPercent, { color: textColor }]}>
                {percentages.neutral.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.dot, { backgroundColor: Colors.custom.red }]}
              />
              <Text style={[styles.legendLabel, { color: textColor }]}>
                Negative
              </Text>
              <Text style={[styles.legendPercent, { color: textColor }]}>
                {percentages.negative.toFixed(1)}%
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 4,
  },
  noDataOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 8,
  },
  noDataText: {
    color: "white",
    fontSize: 18,
    fontWeight: 600,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    margin: 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: 500,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    padding: 1,
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: "25%",
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
    marginTop: 16,
    flexWrap: "nowrap",
    paddingHorizontal: 8,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
  common: {
    fontSize: 13,
    marginTop: 16,
  },
});
