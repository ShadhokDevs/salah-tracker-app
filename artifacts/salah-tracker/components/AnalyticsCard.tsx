import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  DayRecord,
  countCompletedPrayers,
  countJamaahPrayers,
} from "@/context/PrayerContext";
import { useColors } from "@/hooks/useColors";

interface AnalyticsCardProps {
  year: number;
  month: number;
  allRecords: Record<string, DayRecord>;
}

function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}

function getDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function getMonthPrefix(y: number, m: number): string {
  return `${y}-${padTwo(m + 1)}`;
}

interface MonthStats {
  completed: number;
  jamaah: number;
  possible: number;
  rate: number;
  jamaahRate: number;
  currentStreak: number;
  bestStreak: number;
}

function computeMonthStats(
  year: number,
  month: number,
  records: Record<string, DayRecord>,
  today: Date
): MonthStats {
  const prefix = getMonthPrefix(year, month);
  const totalDays = getDaysInMonth(year, month);
  const cutoffDay =
    year === today.getFullYear() && month === today.getMonth()
      ? today.getDate()
      : totalDays;

  let completed = 0;
  let jamaah = 0;

  for (let d = 1; d <= cutoffDay; d++) {
    const key = `${prefix}-${padTwo(d)}`;
    if (records[key]) {
      completed += countCompletedPrayers(records[key]);
      jamaah += countJamaahPrayers(records[key]);
    }
  }

  const possible = cutoffDay * 5;
  const rate = possible > 0 ? (completed / possible) * 100 : 0;
  const jamaahRate = completed > 0 ? (jamaah / completed) * 100 : 0;

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;
  for (let d = 1; d <= cutoffDay; d++) {
    const key = `${prefix}-${padTwo(d)}`;
    const count = records[key] ? countCompletedPrayers(records[key]) : 0;
    if (count === 5) {
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }
  }
  currentStreak = streak;

  return { completed, jamaah, possible, rate, jamaahRate, currentStreak, bestStreak };
}

function getMotivationalMessage(
  currentRate: number,
  prevRate: number | null
): string {
  const pct = Math.round(currentRate);
  if (prevRate === null) {
    return `Alhamdulillah. You completed ${pct}% of your prayers this month. Keep building consistency and strengthening your relationship with Allah. May Allah make you steadfast and increase you in goodness. Ameen.`;
  }
  const delta = Math.abs(Math.round(currentRate - prevRate));
  if (currentRate >= prevRate) {
    return `MashaAllah. You improved by ${delta}% compared to last month. Your consistency is growing, and every prayer matters. May Allah accept your efforts and make next month even better. InshaAllah.`;
  }
  return `Alhamdulillah for every step taken toward Allah. Your completion rate decreased by ${delta}% compared to last month. This month may have been difficult, but every new day is another opportunity. Next month, we will come back stronger, InshaAllah. May Allah make consistency easy and accept every sincere effort.`;
}

function StatRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.statRow}>
      <Text
        style={[
          styles.statLabel,
          { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.statValue,
          { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function AnalyticsCard({ year, month, allRecords }: AnalyticsCardProps) {
  const colors = useColors();

  const { stats, motivationalMessage } = useMemo(() => {
    const today = new Date();
    const s = computeMonthStats(year, month, allRecords, today);

    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const prevPrefix = getMonthPrefix(prevY, prevM);
    const hasPrevData = Object.keys(allRecords).some((k) =>
      k.startsWith(prevPrefix)
    );
    let prevRate: number | null = null;
    if (hasPrevData) {
      const ps = computeMonthStats(prevY, prevM, allRecords, today);
      prevRate = ps.rate;
    }

    return {
      stats: s,
      motivationalMessage: getMotivationalMessage(s.rate, prevRate),
    };
  }, [year, month, allRecords]);

  const missed = stats.possible - stats.completed;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.stats}>
        <StatRow label="Total Possible" value={String(stats.possible)} />
        <StatRow label="Completed" value={String(stats.completed)} />
        <StatRow label="Missed" value={String(missed)} />
        <StatRow
          label="Completion Rate"
          value={`${Math.round(stats.rate)}%`}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatRow label="Total Jama'ah" value={String(stats.jamaah)} />
        <StatRow
          label="Jama'ah Rate"
          value={`${Math.round(stats.jamaahRate)}%`}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatRow
          label="Current Streak"
          value={`${stats.currentStreak} days`}
        />
        <StatRow label="Best Streak" value={`${stats.bestStreak} days`} />
      </View>

      <View
        style={[
          styles.messageCard,
          {
            backgroundColor: colors.secondary,
            borderRadius: Math.max(colors.radius - 4, 6),
          },
        ]}
      >
        <Text
          style={[
            styles.message,
            { color: colors.foreground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {motivationalMessage}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  stats: { gap: 10 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 15 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  messageCard: { padding: 16 },
  message: { fontSize: 14, lineHeight: 22 },
});
