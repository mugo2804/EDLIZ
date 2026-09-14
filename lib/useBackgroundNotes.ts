"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "edliz-surfer-notes-v1";

type NotesState = Record<string, string>; // topicId -> generated background note

const EMPTY_STATE: NotesState = {};

function loadState(): NotesState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as NotesState) : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

let cache: NotesState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): NotesState {
  if (cache === null) cache = loadState();
  return cache;
}

function getServerSnapshot(): NotesState {
  return EMPTY_STATE;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function commit(next: NotesState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l());
}

export function useBackgroundNotes() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveNote = useCallback((topicId: string, note: string) => {
    commit({ ...getSnapshot(), [topicId]: note });
  }, []);

  return {
    getNote: (topicId: string): string | undefined => state[topicId],
    saveNote,
  };
}
