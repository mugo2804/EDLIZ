"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { BackgroundNoteResult } from "@/app/api/related-notes/route";

const STORAGE_KEY = "edliz-surfer-notes-v2";
// kimi-k3 is a very large reasoning model -- real requests have taken
// anywhere from ~60s to ~2.5min. Bound the wait generously rather than
// leaving a request to hang forever if the upstream truly stalls.
const CLIENT_TIMEOUT_MS = 5 * 60 * 1000;

type Store = {
  notes: Record<string, BackgroundNoteResult>; // topicId -> generated note (persisted)
  generatingSince: Record<string, number>; // topicId -> Date.now() when generation started (in-memory)
  errors: Record<string, string>; // topicId -> last error message (in-memory)
};

const EMPTY_STORE: Store = { notes: {}, generatingSince: {}, errors: {} };

function loadNotes(): Record<string, BackgroundNoteResult> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistNotes(notes: Record<string, BackgroundNoteResult>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

// Module-level store (not component state) so an in-flight generation keeps
// running -- and its result lands somewhere -- even if the component that
// started it unmounts, e.g. the user navigates from /today to /browse and
// back while a slow response is still in flight.
let store: Store | null = null;
const listeners = new Set<() => void>();

function ensureStore(): Store {
  if (store === null) store = { ...EMPTY_STORE, notes: loadNotes() };
  return store;
}

function getSnapshot(): Store {
  return ensureStore();
}

function getServerSnapshot(): Store {
  return EMPTY_STORE;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function setStore(patch: Partial<Store>) {
  store = { ...ensureStore(), ...patch };
  listeners.forEach((l) => l());
}

async function generate(topicId: string, chapterTitle: string, sectionTitle: string, sourceText: string) {
  const current = ensureStore();
  if (current.generatingSince[topicId]) return; // already in flight, don't double-fire

  const { [topicId]: _dropped, ...restErrors } = current.errors;
  void _dropped;
  setStore({
    generatingSince: { ...current.generatingSince, [topicId]: Date.now() },
    errors: restErrors,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch("/api/related-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterTitle, sectionTitle, sourceText }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

    const after = ensureStore();
    const { [topicId]: _g, ...restGenerating } = after.generatingSince;
    void _g;
    const nextNotes = { ...after.notes, [topicId]: data.note as BackgroundNoteResult };
    persistNotes(nextNotes);
    setStore({ notes: nextNotes, generatingSince: restGenerating });
  } catch (e) {
    const after = ensureStore();
    const { [topicId]: _g2, ...restGenerating } = after.generatingSince;
    void _g2;
    const message =
      e instanceof Error
        ? e.name === "AbortError"
          ? "This is taking much longer than usual (5+ minutes) and was cancelled. Try again, or switch NVIDIA_MODEL in .env.local to a faster model."
          : e.message
        : "Something went wrong.";
    setStore({ generatingSince: restGenerating, errors: { ...after.errors, [topicId]: message } });
  } finally {
    clearTimeout(timeout);
  }
}

export function useBackgroundNotes() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const start = useCallback((topicId: string, chapterTitle: string, sectionTitle: string, sourceText: string) => {
    void generate(topicId, chapterTitle, sectionTitle, sourceText);
  }, []);

  return {
    getNote: (topicId: string): BackgroundNoteResult | undefined => state.notes[topicId],
    isGenerating: (topicId: string): boolean => topicId in state.generatingSince,
    getGeneratingSince: (topicId: string): number | undefined => state.generatingSince[topicId],
    getError: (topicId: string): string | undefined => state.errors[topicId],
    generate: start,
  };
}

// Ticks once a second while `active` is true -- drives the "Nns elapsed"
// display without polling Date.now() on every render.
export function useElapsedSeconds(since: number | undefined): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!since) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since]);

  if (!since) return 0;
  return Math.max(0, Math.floor((now - since) / 1000));
}
