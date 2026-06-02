import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PRAYER_KEYS,
  PrayerKey,
  getPrayerNames,
  isFridayDate,
  usePrayer,
} from "@/context/PrayerContext";
import { PrayerButton } from "@/components/PrayerButton";
import { useColors } from "@/hooks/useColors";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

function formatTodayDate(dateStr: string): { day: string; date: string } {
  const parts = dateStr.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const date = new Date(y, m - 1, d);
  return {
    day: DAY_NAMES[date.getDay()],
    date: `${MONTH_NAMES[m - 1]} ${d}, ${y}`,
  };
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayRecord, todayDate, logPrayer } = usePrayer();
  const isWeb = Platform.OS === "web";

  const prayerNames = useMemo(() => getPrayerNames(todayDate), [todayDate]);
  const isFriday = useMemo(() => isFridayDate(todayDate), [todayDate]);
  const { day, date } = useMemo(() => formatTodayDate(todayDate), [todayDate]);

  const completed = PRAYER_KEYS.filter((k) => todayRecord[k] !== "none").length;
  const jamaahCount = PRAYER_KEYS.filter((k) => todayRecord[k] === "jamaah").length;

  const handleTap = (key: PrayerKey, isJummah: boolean) => {
    if (isJummah) {
      const cur = todayRecord[key];
      logPrayer(key, cur === "jamaah" ? "none" : "jamaah");
    } else {
      const cur = todayRecord[key];
      if (cur === "none") logPrayer(key, "individual");
      else if (cur === "individual") logPrayer(key, "none");
      else logPrayer(key, "individual");
    }
  };

  const handleLongPress = (key: PrayerKey, isJummah: boolean) => {
    if (isJummah) {
      logPrayer(key, "jamaah");
    } else {
      const cur = todayRecord[key];
      logPrayer(key, cur === "jamaah" ? "none" : "jamaah");
    }
  };

  const progressPct = Math.round((completed / 5) * 100);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: isWeb ? 67 + 16 : insets.top + 16,
          paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.dayText,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {day}
        </Text>
        <Text
          style={[
            styles.dateText,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          {date}
        </Text>
        {isFriday && (
          <View
            style={[
              styles.fridayBadge,
              { backgroundColor: colors.prayerJamaah },
            ]}
          >
            <Text
              style={[
                styles.fridayText,
                { fontFamily: "Inter_500Medium" },
              ]}
            >
              Jumu\u2019ah
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.progressCard,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNum,
                {
                  color: colors.prayerIndividual,
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              {completed}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              of 5 prayers
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNum,
                {
                  color: colors.prayerJamaah,
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              {jamaahCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Jama\u2019ah
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNum,
                {
                  color: completed === 5 ? colors.prayerIndividual : colors.foreground,
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              {progressPct}%
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              today
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: colors.prayerNone },
          ]}
        >
          <View
            style={[
              styles.progressBarFg,
              {
                width: `${progressPct}%` as any,
                backgroundColor:
                  completed === 5 ? colors.prayerIndividual : colors.accent,
              },
            ]}
          />
        </View>
      </View>

      <View
        style={[
          styles.prayerList,
          {
            borderRadius: colors.radius,
            borderColor: colors.border,
            overflow: "hidden",
          },
        ]}
      >
        {PRAYER_KEYS.map((key, i) => {
          const isJummah = isFriday && key === "dhuhr";
          return (
            <React.Fragment key={key}>
              <PrayerButton
                prayerName={prayerNames[i]}
                state={todayRecord[key]}
                isJummah={isJummah}
                onTap={() => handleTap(key, isJummah)}
                onLongPress={() => handleLongPress(key, isJummah)}
              />
              {i < PRAYER_KEYS.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <Text
        style={[
          styles.resetHint,
          { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
        ]}
      >
        Prayer day resets at 3:00 AM
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { gap: 4, paddingTop: 8 },
  dayText: { fontSize: 14 },
  dateText: { fontSize: 26 },
  fridayBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  fridayText: { color: "#FFFFFF", fontSize: 12 },
  progressCard: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 3 },
  statNum: { fontSize: 28 },
  statLabel: { fontSize: 12 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 36 },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFg: {
    height: "100%",
    borderRadius: 3,
  },
  prayerList: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  separator: { height: StyleSheet.hairlineWidth },
  resetHint: {
    textAlign: "center",
    fontSize: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
});
