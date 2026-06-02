import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePrayer } from "@/context/PrayerContext";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { HeatmapCalendar } from "@/components/HeatmapCalendar";
import { useColors } from "@/hooks/useColors";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allRecords, todayDate } = usePrayer();
  const isWeb = Platform.OS === "web";

  const today = useMemo(() => {
    const parts = todayDate.split("-");
    return { year: Number(parts[0]), month: Number(parts[1]) - 1 };
  }, [todayDate]);

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isCurrentMonth =
    viewYear === today.year && viewMonth === today.month;

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedRecord = selectedDate ? (allRecords[selectedDate] ?? null) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: isWeb ? 67 + 16 : insets.top + 16,
            paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthHeader}>
          <Pressable onPress={goToPrevMonth} hitSlop={16} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.monthTitleBlock}>
            <Text
              style={[
                styles.monthText,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              {MONTHS[viewMonth]}
            </Text>
            <Text
              style={[
                styles.yearText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {viewYear}
            </Text>
          </View>
          <Pressable
            onPress={goToNextMonth}
            hitSlop={16}
            style={[styles.navBtn, { opacity: isCurrentMonth ? 0.25 : 1 }]}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.foreground}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={() => setShowAnalytics((v) => !v)}
          style={[
            styles.recapBtn,
            {
              backgroundColor: showAnalytics ? colors.primary : colors.secondary,
              borderRadius: 22,
            },
          ]}
        >
          <Ionicons
            name={showAnalytics ? "stats-chart" : "stats-chart-outline"}
            size={15}
            color={showAnalytics ? "#FFFFFF" : colors.foreground}
          />
          <Text
            style={[
              styles.recapBtnText,
              {
                color: showAnalytics ? "#FFFFFF" : colors.foreground,
                fontFamily: "Inter_500Medium",
              },
            ]}
          >
            Monthly Recap
          </Text>
        </Pressable>

        {showAnalytics && (
          <AnalyticsCard
            year={viewYear}
            month={viewMonth}
            allRecords={allRecords}
          />
        )}

        <HeatmapCalendar
          year={viewYear}
          month={viewMonth}
          records={allRecords}
          todayDate={todayDate}
          onDayPress={setSelectedDate}
        />

        <View style={styles.legend}>
          {[
            { color: colors.heatmap0, label: "0" },
            { color: colors.heatmap1, label: "1–2" },
            { color: colors.heatmap2, label: "3" },
            { color: colors.heatmap3, label: "4" },
            { color: colors.heatmap4, label: "5" },
          ].map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: color, borderRadius: 3 },
                ]}
              />
              <Text
                style={[
                  styles.legendLabel,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <DayDetailSheet
        visible={selectedDate !== null}
        date={selectedDate ?? ""}
        record={selectedRecord}
        onClose={() => setSelectedDate(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  navBtn: { padding: 4 },
  monthTitleBlock: { alignItems: "center", gap: 1 },
  monthText: { fontSize: 22 },
  yearText: { fontSize: 14 },
  recapBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  recapBtnText: { fontSize: 14 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    paddingTop: 2,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: { width: 12, height: 12 },
  legendLabel: { fontSize: 11 },
});
