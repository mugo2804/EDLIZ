"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "edliz-surfer-bookmarks-v1";

type BookmarksState = Record<string, true>; // topicId -> bookmarked

const EMPTY_STATE: BookmarksState = {};

function loadState(): BookmarksState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

let cache: BookmarksState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): BookmarksState {
  if (cache === null) cache = loadState();
  return cache;
}

function getServerSnapshot(): BookmarksState {
  return EMPTY_STATE;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function commit(next: BookmarksState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l());
}

export function useBookmarks() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((topicId: string) => {
    const current = getSnapshot();
    if (current[topicId]) {
      const next = { ...current };
      delete next[topicId];
      commit(next);
    } else {
      commit({ ...current, [topicId]: true });
    }
  }, []);

  return {
    isBookmarked: (topicId: string): boolean => Boolean(state[topicId]),
    bookmarkedIds: new Set(Object.keys(state)),
    toggle,
  };
}
