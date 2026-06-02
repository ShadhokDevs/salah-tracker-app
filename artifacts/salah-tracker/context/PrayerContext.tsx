import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

export type PrayerState = "none" | "individual" | "jamaah";
export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface DayRecord {
  date: string;
  fajr: PrayerState;
  dhuhr: PrayerState;
  asr: PrayerState;
  maghrib: PrayerState;
  isha: PrayerState;
}

const STORAGE_KEY = "salah_tracker_records_v1";
export const PRAYER_KEYS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function getLogicalDate(): string {
  const now = new Date();
  const d =
    now.getHours() < 3
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      : now;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isFridayDate(dateStr: string): boolean {
  const parts = dateStr.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d).getDay() === 5;
}

export function getPrayerNames(dateStr: string): string[] {
  return isFridayDate(dateStr)
    ? ["Fajr", "Jummah", "Asr", "Maghrib", "Isha"]
    : ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
}

export function countCompletedPrayers(record: DayRecord): number {
  return PRAYER_KEYS.filter((k) => record[k] !== "none").length;
}

export function countJamaahPrayers(record: DayRecord): number {
  return PRAYER_KEYS.filter((k) => record[k] === "jamaah").length;
}

export function emptyRecord(date: string): DayRecord {
  return {
    date,
    fajr: "none",
    dhuhr: "none",
    asr: "none",
    maghrib: "none",
    isha: "none",
  };
}

interface PrayerContextType {
  todayRecord: DayRecord;
  todayDate: string;
  logPrayer: (key: PrayerKey, state: PrayerState) => void;
  allRecords: Record<string, DayRecord>;
  isLoaded: boolean;
}

const PrayerContext = createContext<PrayerContextType>({
  todayRecord: emptyRecord(getLogicalDate()),
  todayDate: getLogicalDate(),
  logPrayer: () => {},
  allRecords: {},
  isLoaded: false,
});

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<Record<string, DayRecord>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Record<string, DayRecord> = stored
        ? (JSON.parse(stored) as Record<string, DayRecord>)
        : {};
      const today = getLogicalDate();
      if (!parsed[today]) {
        parsed[today] = emptyRecord(today);
      }
      setRecords(parsed);
      setIsLoaded(true);
    } catch {
      const today = getLogicalDate();
      setRecords({ [today]: emptyRecord(today) });
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadRecords();
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        loadRecords();
      }
    });
    return () => sub.remove();
  }, [loadRecords]);

  const logPrayer = useCallback((key: PrayerKey, state: PrayerState) => {
    const today = getLogicalDate();
    setRecords((prev) => {
      const updated: Record<string, DayRecord> = {
        ...prev,
        [today]: {
          ...(prev[today] ?? emptyRecord(today)),
          [key]: state,
        },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const todayDate = getLogicalDate();
  const todayRecord = records[todayDate] ?? emptyRecord(todayDate);

  return (
    <PrayerContext.Provider
      value={{ todayRecord, todayDate, logPrayer, allRecords: records, isLoaded }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  return useContext(PrayerContext);
}
