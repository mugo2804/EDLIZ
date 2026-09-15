"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "edliz-surfer-font-scale-v1";

export type FontScale = 0 | 1 | 2; // small / normal / large

const DEFAULT_SCALE: FontScale = 1;

function loadState(): FontScale {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : DEFAULT_SCALE;
    return n === 0 || n === 1 || n === 2 ? n : DEFAULT_SCALE;
  } catch {
    return DEFAULT_SCALE;
  }
}

let cache: FontScale | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): FontScale {
  if (cache === null) cache = loadState();
  return cache;
}

function getServerSnapshot(): FontScale {
  return DEFAULT_SCALE;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function commit(next: FontScale) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l());
}

export function useReaderFontScale() {
  const scale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setScale = useCallback((next: FontScale) => {
    commit(next);
  }, []);

  return { scale, setScale };
}
