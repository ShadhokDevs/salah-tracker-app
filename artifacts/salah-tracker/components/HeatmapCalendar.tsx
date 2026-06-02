import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  DayRecord,
  countCompletedPrayers,
} from "@/context/PrayerContext";
import { useColors } from "@/hooks/useColors";

interface HeatmapCalendarProps {
  year: number;
  month: number;
  records: Record<string, DayRecord>;
  todayDate: string;
  onDayPress: (dateStr: string) => void;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}

export function HeatmapCalendar({
  year,
  month,
  records,
  todayDate,
  onDayPress,
}: HeatmapCalendarProps) {
  const colors = useColors();

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const result: (number | null)[][] = [];
    for (let r = 0; r < cells.length / 7; r++) {
      result.push(cells.slice(r * 7, (r + 1) * 7));
    }
    return result;
  }, [year, month]);

  const getDateStr = (day: number) =>
    `${year}-${padTwo(month + 1)}-${padTwo(day)}`;

  const isFuture = (day: number) => {
    const cellDate = new Date(year, month, day);
    const [ty, tm, td] = todayDate.split("-").map(Number);
    const today = new Date(ty, tm - 1, td);
    return cellDate > today;
  };

  const isToday = (day: number) => getDateStr(day) === todayDate;

  const firstTrackedDate = useMemo(() => {
    const keys = Object.keys(records);
    if (keys.length === 0) return null;
    return keys.reduce((a, b) => (a < b ? a : b));
  }, [records]);

  const isBeforeTracking = (day: number) => {
    if (!firstTrackedDate) return true;
    return getDateStr(day) < firstTrackedDate;
  };

  const getCellColor = (day: number | null): string => {
    if (!day) return "transparent";
    if (isFuture(day)) return colors.heatmapEmpty;
    if (isBeforeTracking(day)) return colors.heatmapEmpty;
    const dateStr = getDateStr(day);
    const record = records[dateStr];
    if (!record) return colors.heatmap0;
    const count = countCompletedPrayers(record);
    if (count === 0) return colors.heatmap0;
    if (count <= 2) return colors.heatmap1;
    if (count === 3) return colors.heatmap2;
    if (count === 4) return colors.heatmap3;
    return colors.heatmap4;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((l, i) => (
          <Text
            key={i}
            style={[
              styles.dayLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
            ]}
          >
            {l}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((day, di) => {
            const cellColor = getCellColor(day);
            const todayBorder = day && isToday(day);
            const canPress = !!day && !isFuture(day);
            return (
              <Pressable
                key={di}
                onPress={() => day && canPress && onDayPress(getDateStr(day))}
                disabled={!canPress}
                style={({ pressed }) => [
                  styles.cell,
                  {
                    backgroundColor: cellColor,
                    borderRadius: 7,
                    opacity: pressed ? 0.75 : 1,
                    borderWidth: todayBorder ? 2 : 0,
                    borderColor: todayBorder ? colors.primary : "transparent",
                  },
                ]}
              >
                {day ? (
                  <Text
                    style={[
                      styles.dayNum,
                      {
                        color: isFuture(day) || isBeforeTracking(day)
                          ? colors.mutedForeground
                          : countCompletedPrayers(records[getDateStr(day)] ?? { fajr: "none", dhuhr: "none", asr: "none", maghrib: "none", isha: "none", date: "" }) >= 3
                          ? "#1A2E1A"
                          : "#1A1A2E",
                        fontFamily: "Inter_500Medium",
                      },
                    ]}
                  >
                    {day}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5 },
  dayLabels: {
    flexDirection: "row",
    marginBottom: 2,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
  },
  week: {
    flexDirection: "row",
    gap: 5,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: {
    fontSize: 11,
  },
});
