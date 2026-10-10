"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X, CornerDownLeft } from "lucide-react";
import { TOPICS, type Topic } from "@/lib/topics";

const MAX_RESULTS = 8;
const EXCERPT_RADIUS = 60;

// Common clinical abbreviations clinicians actually type at the point of
// care -- when the query exactly matches one of these, results also match
// on the expansion, since the guideline text itself mostly spells terms out.
const ABBREVIATIONS: Record<string, string> = {
  art: "antiretroviral therapy",
  arv: "antiretroviral",
  hiv: "human immunodeficiency virus",
  sti: "sexually transmitted infection",
  std: "sexually transmitted disease",
  tb: "tuberculosis",
  uti: "urinary tract infection",
  pid: "pelvic inflammatory disease",
  anc: "antenatal care",
  pmtct: "prevention of mother to child transmission",
  copd: "chronic obstructive pulmonary disease",
  dm: "diabetes mellitus",
  htn: "hypertension",
  cvd: "cardiovascular disease",
  mdr: "multidrug resistant",
  rdt: "rapid diagnostic test",
  iptp: "intermittent preventive treatment",
  cns: "central nervous system",
  gi: "gastrointestinal",
  aki: "acute kidney injury",
  ckd: "chronic kidney disease",
  pep: "post-exposure prophylaxis",
  prep: "pre-exposure prophylaxis",
  awa: "access watch reserve",
  aware: "access watch reserve",
};

type Match = { topic: Topic; excerpt: string | null };

function search(query: string): Match[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const expansion = ABBREVIATIONS[q];

  const titleHits: Match[] = [];
  const chapterHits: Match[] = [];
  const bodyHits: Match[] = [];
  const seen = new Set<string>();

  function matchesQuery(haystack: string): boolean {
    const lower = haystack.toLowerCase();
    return lower.includes(q) || (expansion !== undefined && lower.includes(expansion));
  }

  for (const topic of TOPICS) {
    if (seen.has(topic.id)) continue;
    if (matchesQuery(topic.sectionTitle)) {
      titleHits.push({ topic, excerpt: null });
      seen.add(topic.id);
      continue;
    }
    if (matchesQuery(topic.chapterTitle)) {
      chapterHits.push({ topic, excerpt: null });
      seen.add(topic.id);
      continue;
    }
    const lowerText = topic.text.toLowerCase();
    const idx = lowerText.indexOf(q) !== -1 ? lowerText.indexOf(q) : expansion !== undefined ? lowerText.indexOf(expansion) : -1;
    if (idx !== -1) {
      const matchLen = lowerText.indexOf(q) !== -1 ? q.length : (expansion?.length ?? 0);
      const start = Math.max(0, idx - EXCERPT_RADIUS);
      const end = Math.min(topic.text.length, idx + matchLen + EXCERPT_RADIUS);
      const excerpt = (start > 0 ? "…" : "") + topic.text.slice(start, end).replace(/\s+/g, " ").trim() + "…";
      bodyHits.push({ topic, excerpt });
      seen.add(topic.id);
    }
  }

  return [...titleHits, ...chapterHits, ...bodyHits].slice(0, MAX_RESULTS);
}

export function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => search(query), [query]);

  // Mounted only while open (see NavBar), so this runs fresh each time the
  // modal opens -- no separate "reset on open" state sync needed.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function go(topic: Topic) {
    router.push(`/topic/${topic.id}`);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex].topic);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-teal-950/50 px-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-teal-950"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-teal-900/10 px-4 py-3 dark:border-white/10">
          <SearchIcon size={18} className="shrink-0 text-teal-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search all 540 topics…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
          />
          <button onClick={onClose} className="shrink-0 rounded-full p-1 text-teal-500 hover:bg-teal-50 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <p className="px-4 py-8 text-center text-sm opacity-50">Start typing a topic, chapter, or drug name…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm opacity-50">No topics match &quot;{query}&quot;.</p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.topic.id}>
                  <button
                    onClick={() => go(r.topic)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left ${
                      i === activeIndex ? "bg-teal-50 dark:bg-white/10" : ""
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
                      {r.topic.chapterTitle}
                    </span>
                    <span className="text-sm font-medium text-teal-950 dark:text-teal-50">{r.topic.sectionTitle}</span>
                    {r.excerpt && <span className="text-xs opacity-60">{r.excerpt}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-teal-900/10 px-4 py-2 text-[11px] opacity-50 dark:border-white/10">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={11} /> select
          </span>
          <span>↑↓ navigate</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
