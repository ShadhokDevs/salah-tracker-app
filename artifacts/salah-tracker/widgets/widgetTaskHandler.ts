import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import {
  PRAYER_KEYS,
  emptyRecord,
  getLogicalDate,
} from "@/context/PrayerContext";
import { SalahWidget, WidgetPrayerState } from "./SalahWidget";

const STORAGE_KEY = "salah_tracker_records_v1";

type StoredRecords = Record<
  string,
  {
    date: string;
    fajr: WidgetPrayerState;
    dhuhr: WidgetPrayerState;
    asr: WidgetPrayerState;
    maghrib: WidgetPrayerState;
    isha: WidgetPrayerState;
  }
>;

async function readPrayers(): Promise<WidgetPrayerState[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const records: StoredRecords = raw ? (JSON.parse(raw) as StoredRecords) : {};
    const today = getLogicalDate();
    const rec = records[today] ?? emptyRecord(today);
    return PRAYER_KEYS.map((k) => rec[k] as WidgetPrayerState);
  } catch {
    return ["none", "none", "none", "none", "none"];
  }
}

async function writePrayer(index: number, next: WidgetPrayerState) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const records: StoredRecords = raw ? (JSON.parse(raw) as StoredRecords) : {};
    const today = getLogicalDate();
    const rec = records[today] ?? emptyRecord(today);
    (rec as Record<string, string>)[PRAYER_KEYS[index]] = next;
    records[today] = rec;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // silently ignore storage errors
  }
}

function cycleState(current: WidgetPrayerState): WidgetPrayerState {
  if (current === "none") return "individual";
  if (current === "individual") return "jamaah";
  return "none";
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo, renderWidget } = props;

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const prayers = await readPrayers();
      renderWidget(
        React.createElement(SalahWidget, { prayers })
      );
      break;
    }

    case "WIDGET_CLICK": {
      if (props.clickAction === "PRAYER_TAP") {
        const idx = props.clickActionData?.index as number;
        const prayers = await readPrayers();
        const next = cycleState(prayers[idx]);
        await writePrayer(idx, next);
        const updated = await readPrayers();
        renderWidget(
          React.createElement(SalahWidget, { prayers: updated })
        );
      }
      break;
    }

    case "WIDGET_DELETED":
    default:
      break;
  }
}
