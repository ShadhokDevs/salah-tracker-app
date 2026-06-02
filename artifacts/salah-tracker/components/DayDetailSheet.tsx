import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DayRecord,
  PRAYER_KEYS,
  PrayerKey,
  PrayerState,
  getPrayerNames,
} from "@/context/PrayerContext";
import { useColors } from "@/hooks/useColors";

interface DayDetailSheetProps {
  visible: boolean;
  date: string;
  record: DayRecord | null;
  onClose: () => void;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

function getStateInfo(
  state: PrayerState,
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>
): { label: string; color: string; isJamaah: boolean } {
  if (state === "individual")
    return { label: "Individual", color: colors.prayerIndividual, isJamaah: false };
  if (state === "jamaah")
    return { label: "Jama\u2019ah", color: colors.prayerJamaah, isJamaah: true };
  return { label: "Missed", color: colors.mutedForeground, isJamaah: false };
}

export function DayDetailSheet({
  visible,
  date,
  record,
  onClose,
}: DayDetailSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 180,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const prayerNames = date ? getPrayerNames(date) : PRAYER_KEYS.map(() => "");

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <Pressable style={styles.backdropPressable} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
      </Pressable>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text
          style={[
            styles.dateTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {date ? formatDate(date) : ""}
        </Text>

        <View style={styles.prayers}>
          {PRAYER_KEYS.map((key: PrayerKey, i: number) => {
            const state: PrayerState = record?.[key] ?? "none";
            const { label, color, isJamaah } = getStateInfo(state, colors);
            return (
              <View
                key={key}
                style={[styles.prayerRow, { borderBottomColor: colors.border }]}
              >
                <Text
                  style={[
                    styles.prayerName,
                    {
                      color: colors.foreground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {prayerNames[i]}
                </Text>
                <View style={styles.stateRow}>
                  {state === "individual" && (
                    <Ionicons name="checkmark-circle" size={17} color={color} />
                  )}
                  {state === "jamaah" && (
                    <MaterialCommunityIcons
                      name="mosque"
                      size={17}
                      color={color}
                    />
                  )}
                  {state === "none" && (
                    <Ionicons name="close-circle" size={17} color={color} />
                  )}
                  <Text
                    style={[
                      styles.stateLabel,
                      { color, fontFamily: "Inter_500Medium" },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  prayers: {
    gap: 0,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  prayerName: {
    fontSize: 16,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stateLabel: {
    fontSize: 14,
  },
});
