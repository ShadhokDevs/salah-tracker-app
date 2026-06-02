import React from "react";
import {
  FlexWidget,
  SvgWidget,
  TextWidget,
} from "react-native-android-widget";

export type WidgetPrayerState = "none" | "individual" | "jamaah";

interface SalahWidgetProps {
  prayers: WidgetPrayerState[];
}

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const CYAN = "#0891B2";
const DARK_BG = "#121214";
const NONE_BG = "#2A2A35";
const INDIVIDUAL_BG = "#10B981";
const JAMAAH_BG = "#3B82F6";
const BORDER_RADIUS = 18;

const CHECK_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <polyline points="20,6 9,17 4,12" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const MOSQUE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="11" width="18" height="10" rx="1" fill="#FFFFFF"/>
  <rect x="9" y="14" width="6" height="7" rx="1" fill="${JAMAAH_BG}"/>
  <path d="M12 4 C9 4 7 6 7 8 L7 11 L17 11 L17 8 C17 6 15 4 12 4Z" fill="#FFFFFF"/>
  <circle cx="12" cy="2.5" r="1.5" fill="#FFFFFF"/>
  <rect x="4" y="9" width="3" height="2" rx="0.5" fill="#FFFFFF"/>
  <rect x="17" y="9" width="3" height="2" rx="0.5" fill="#FFFFFF"/>
</svg>`;

function CheckBox({
  state,
  index,
}: {
  state: WidgetPrayerState;
  index: number;
}) {
  const bg =
    state === "individual"
      ? INDIVIDUAL_BG
      : state === "jamaah"
      ? JAMAAH_BG
      : NONE_BG;

  return (
    <FlexWidget
      clickAction="PRAYER_TAP"
      clickActionData={{ index }}
      style={{
        flex: 1,
        height: "match_parent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FlexWidget
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {state === "individual" && (
          <SvgWidget
            svg={CHECK_SVG}
            style={{ width: 22, height: 22 }}
          />
        )}
        {state === "jamaah" && (
          <SvgWidget
            svg={MOSQUE_SVG}
            style={{ width: 22, height: 22 }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  );
}

export function SalahWidget({ prayers }: SalahWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: DARK_BG,
        borderRadius: BORDER_RADIUS,
      }}
    >
      {/* Prayer names header — 1/4 height */}
      <FlexWidget
        style={{
          width: "match_parent",
          flex: 1,
          flexDirection: "row",
          backgroundColor: CYAN,
          borderTopLeftRadius: BORDER_RADIUS,
          borderTopRightRadius: BORDER_RADIUS,
          alignItems: "center",
          paddingHorizontal: 4,
        }}
      >
        {PRAYER_NAMES.map((name) => (
          <TextWidget
            key={name}
            text={name}
            style={{
              flex: 1,
              textAlign: "center",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: "bold",
              textShadowColor: "#000000",
              textShadowRadius: 3,
              textShadowOffset: { width: 1, height: 1 },
            }}
          />
        ))}
      </FlexWidget>

      {/* Checkboxes — 3/4 height */}
      <FlexWidget
        style={{
          width: "match_parent",
          flex: 3,
          flexDirection: "row",
          borderBottomLeftRadius: BORDER_RADIUS,
          borderBottomRightRadius: BORDER_RADIUS,
          alignItems: "center",
        }}
      >
        {prayers.map((state, i) => (
          <CheckBox key={i} state={state} index={i} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
