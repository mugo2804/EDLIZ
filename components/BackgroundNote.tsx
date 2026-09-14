"use client";

import { useState } from "react";
import { Sparkles, RefreshCcw } from "lucide-react";
import { useBackgroundNotes } from "@/lib/useBackgroundNotes";

export function BackgroundNote({
  topicId,
  chapterTitle,
  sectionTitle,
}: {
  topicId: string;
  chapterTitle: string;
  sectionTitle: string;
}) {
  const { getNote, saveNote } = useBackgroundNotes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const note = getNote(topicId);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/related-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterTitle, sectionTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      saveNote(topicId, data.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-teal-900/10 bg-teal-50/60 p-5 dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
          <Sparkles size={14} />
          Background &middot; AI-generated
        </span>
        {note && (
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline disabled:opacity-50 dark:text-teal-300"
          >
            <RefreshCcw size={12} />
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        )}
      </div>

      {note ? (
        <p className="mt-3 text-sm leading-relaxed opacity-90">{note}</p>
      ) : (
        <div className="mt-3">
          <p className="text-sm opacity-70">
            Get a short, AI-generated background note on the concept behind this section — not
            part of the official guideline, just context to help it click. Never a source for
            dosing.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="mt-3 rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate background notes"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
