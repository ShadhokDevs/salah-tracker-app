import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { PrayerState } from "@/context/PrayerContext";
import { useColors } from "@/hooks/useColors";

interface PrayerButtonProps {
  prayerName: string;
  state: PrayerState;
  isJummah: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

export function PrayerButton({
  prayerName,
  state,
  isJummah,
  onTap,
  onLongPress,
}: PrayerButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTap();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };

  const getBg = () => {
    if (state === "individual") return colors.prayerIndividual;
    if (state === "jamaah") return colors.prayerJamaah;
    return colors.prayerNone;
  };

  const getFg = () => {
    if (state === "none") return colors.prayerNoneFg;
    return "#FFFFFF";
  };

  const getSubtext = () => {
    if (isJummah) return "Congregational";
    if (state === "individual") return "Individual";
    if (state === "jamaah") return "Jama\u2019ah";
    return "Hold for Jama\u2019ah";
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={400}
      testID={`prayer-btn-${prayerName}`}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: getBg() },
          animatedStyle,
        ]}
      >
        <View style={styles.leftRow}>
          <View style={styles.iconBox}>
            {state === "individual" && (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
            {state === "jamaah" && (
              <MaterialCommunityIcons name="mosque" size={19} color="#FFFFFF" />
            )}
            {state === "none" && (
              <View
                style={[
                  styles.emptyDot,
                  { backgroundColor: colors.prayerNoneFg },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.name,
              { color: getFg(), fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {prayerName}
          </Text>
        </View>
        <Text
          style={[
            styles.subtext,
            {
              color:
                state === "none"
                  ? colors.prayerNoneFg
                  : "rgba(255,255,255,0.75)",
              fontFamily: "Inter_400Regular",
            },
          ]}
        >
          {getSubtext()}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontSize: 17,
  },
  subtext: {
    fontSize: 12,
  },
});
