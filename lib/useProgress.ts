"use client";

import { useCallback, useSyncExternalStore } from "react";
import { TOPICS, TOTAL_TOPICS } from "@/lib/topics";

const STORAGE_KEY = "edliz-surfer-progress-v1";

type ProgressState = {
  completed: Record<string, string>; // topicId -> ISO date (yyyy-mm-dd) completed
};

const EMPTY_STATE: ProgressState = { completed: {} };

function todayKey(): string {
  return toDateKey(new Date());
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadState(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.completed) return parsed as ProgressState;
    return EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

// Module-level store so every component sharing this hook reads/writes the
// same in-memory snapshot; useSyncExternalStore keeps them all in sync and
// keeps SSR/first-paint consistent with the client value once it loads.
let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): ProgressState {
  if (cache === null) cache = loadState();
  return cache;
}

function getServerSnapshot(): ProgressState {
  return EMPTY_STATE;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = loadState();
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: ProgressState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l());
}

// One streak-freeze credit per 7 distinct days of engagement (lifetime),
// derived fresh from the completion dates every time rather than persisted
// separately -- so there's no separate "freezes used" state that could ever
// drift out of sync with the actual history. A frozen day pauses the streak
// (doesn't break it) without incrementing it, same as it not existing.
const FREEZE_EVERY_N_DAYS = 7;

function computeStreak(dates: Set<string>): { streak: number; freezesRemaining: number } {
  const totalFreezes = Math.floor(dates.size / FREEZE_EVERY_N_DAYS);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // The streak must be alive as of today or yesterday to count at all --
  // freezes bridge isolated gaps within an active streak, they don't
  // resurrect one that's been dormant for a long time.
  if (!dates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dates.has(toDateKey(cursor))) return { streak: 0, freezesRemaining: totalFreezes };
  }

  let streak = 0;
  let freezesUsed = 0;
  while (true) {
    if (dates.has(toDateKey(cursor))) {
      streak += 1;
    } else if (freezesUsed < totalFreezes) {
      freezesUsed += 1;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, freezesRemaining: totalFreezes - freezesUsed };
}

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const markComplete = useCallback((topicId: string) => {
    const current = getSnapshot();
    if (current.completed[topicId]) return;
    commit({ ...current, completed: { ...current.completed, [topicId]: todayKey() } });
  }, []);

  const markIncomplete = useCallback((topicId: string) => {
    const current = getSnapshot();
    if (!(topicId in current.completed)) return;
    const completed = { ...current.completed };
    delete completed[topicId];
    commit({ ...current, completed });
  }, []);

  const completedIds = new Set(Object.keys(state.completed));
  const completedDates = new Set(Object.values(state.completed));
  const completedCount = completedIds.size;
  const { streak, freezesRemaining } = computeStreak(completedDates);
  const completedToday = completedDates.has(todayKey());

  const nextTopic = TOPICS.find((t) => !completedIds.has(t.id)) ?? null;
  const isComplete = completedCount >= TOTAL_TOPICS;

  return {
    completedIds,
    completedCount,
    totalTopics: TOTAL_TOPICS,
    streak,
    freezesRemaining,
    completedToday,
    todaysTopic: nextTopic,
    isComplete,
    markComplete,
    markIncomplete,
    isTopicComplete: (id: string) => completedIds.has(id),
    completedOn: (id: string) => state.completed[id],
  };
}
