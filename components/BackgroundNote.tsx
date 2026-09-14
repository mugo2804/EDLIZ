"use client";

import { useState } from "react";
import { Sparkles, RefreshCcw, CheckCircle2, Stethoscope, Lightbulb } from "lucide-react";
import { useBackgroundNotes } from "@/lib/useBackgroundNotes";

export function BackgroundNote({
  topicId,
  chapterTitle,
  sectionTitle,
  sourceText,
}: {
  topicId: string;
  chapterTitle: string;
  sectionTitle: string;
  sourceText: string;
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
        body: JSON.stringify({ chapterTitle, sectionTitle, sourceText }),
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
    <div className="mt-8 overflow-hidden rounded-2xl border border-teal-900/10 dark:border-white/10">
      <div className="flex items-center justify-between gap-3 bg-teal-900 px-5 py-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-200">
          <Sparkles size={14} />
          Background &middot; AI-generated
        </span>
        {note && (
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-medium text-teal-200 hover:text-white disabled:opacity-50"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        )}
      </div>

      <div className="bg-teal-50/60 p-5 dark:bg-white/5 sm:p-6">
        {note ? (
          <div className="space-y-6">
            <p className="text-sm leading-relaxed sm:text-[15px]">{note.overview}</p>

            {note.keyPoints.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                  Key points
                </h5>
                <ul className="mt-2.5 space-y-2.5">
                  {note.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed sm:text-[15px]">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {note.managementSummary && (
              <div>
                <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                  <Stethoscope size={14} />
                  How EDLIZ approaches it
                </h5>
                <p className="mt-2.5 text-sm leading-relaxed sm:text-[15px]">{note.managementSummary}</p>
              </div>
            )}

            {note.clinicalPearl && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 p-3.5 dark:border-amber-400/20 dark:bg-amber-400/10">
                <Lightbulb size={17} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm leading-relaxed text-amber-900 sm:text-[15px] dark:text-amber-200">
                  {note.clinicalPearl}
                </p>
              </div>
            )}

            <p className="border-t border-teal-900/10 pt-3 text-[11px] leading-relaxed opacity-60 dark:border-white/10">
              AI-synthesized from this section&apos;s guideline text to aid understanding — always confirm exact
              doses and regimens against the EDLIZ text above.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed opacity-70">
              Get a detailed, AI-written study note on this section — the underlying concept and how EDLIZ
              approaches managing it, explained in plain language. Grounded in the guideline text above, not a
              substitute for it.
            </p>
            <button
              onClick={generate}
              disabled={loading}
              className="mt-4 rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Generating…" : "Generate background notes"}
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}
