"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { groupByChapter } from "@/lib/topics";
import { useProgress } from "@/lib/useProgress";
import { useBookmarks } from "@/lib/useBookmarks";

const CHAPTERS = groupByChapter();

export default function Browse() {
  const { isTopicComplete, todaysTopic } = useProgress();
  const { isBookmarked, bookmarkedIds } = useBookmarks();
  const [query, setQuery] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAPTERS.map((chapter) => ({
      ...chapter,
      topics: chapter.topics.filter((t) => {
        if (bookmarkedOnly && !bookmarkedIds.has(t.id)) return false;
        if (!q) return true;
        return (
          t.sectionTitle.toLowerCase().includes(q) ||
          t.chapterTitle.toLowerCase().includes(q) ||
          t.text.toLowerCase().includes(q)
        );
      }),
    })).filter((chapter) => chapter.topics.length > 0);
  }, [query, bookmarkedOnly, bookmarkedIds]);

  const searching = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-teal-950 dark:text-teal-50">Browse all topics</h1>
      <p className="mb-6 text-sm opacity-60">Every chapter of EDLIZ 2025 — jump to anything, any time.</p>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chapters, sections, or drug names…"
          className="w-full flex-1 rounded-full border border-teal-900/10 bg-white px-5 py-3 text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5"
        />
        <button
          onClick={() => setBookmarkedOnly((v) => !v)}
          aria-pressed={bookmarkedOnly}
          className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-5 py-3 text-sm font-medium transition-colors ${
            bookmarkedOnly
              ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
              : "border-teal-900/10 bg-white text-teal-800 shadow-sm hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-teal-200"
          }`}
        >
          <Bookmark size={14} className={bookmarkedOnly ? "fill-current" : ""} />
          Bookmarked
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((chapter) => {
          const doneCount = chapter.topics.filter((t) => isTopicComplete(t.id)).length;
          const hasToday = chapter.topics.some((t) => t.id === todaysTopic?.id);
          const open = searching || bookmarkedOnly || hasToday;
          return (
            <details
              key={chapter.chapterIndex}
              open={open}
              className="group overflow-hidden rounded-2xl border border-teal-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-teal-900 marker:content-none dark:text-teal-100">
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-teal-500 transition-transform group-open:rotate-90">
                    ▶
                  </span>
                  {chapter.chapterTitle}
                </span>
                <span className="shrink-0 rounded-full bg-teal-900/5 px-2.5 py-1 normal-case tracking-normal text-teal-700 dark:bg-white/10 dark:text-teal-200">
                  {doneCount}/{chapter.topics.length}
                </span>
              </summary>
              <ul className="divide-y divide-teal-900/5 border-t border-teal-900/10 dark:divide-white/5 dark:border-white/10">
                {chapter.topics.map((topic) => {
                  const done = isTopicComplete(topic.id);
                  const isToday = todaysTopic?.id === topic.id;
                  const bookmarked = isBookmarked(topic.id);
                  return (
                    <li key={topic.id}>
                      <Link
                        href={`/topic/${topic.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-teal-50 dark:hover:bg-white/[0.04]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              done
                                ? "bg-teal-600 text-white"
                                : "border border-teal-900/20 dark:border-white/20"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </span>
                          <span className="truncate">{topic.sectionTitle}</span>
                          {bookmarked && (
                            <Bookmark size={12} className="shrink-0 fill-amber-500 text-amber-500" />
                          )}
                        </span>
                        {isToday && (
                          <span className="shrink-0 rounded-full bg-teal-600/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                            today
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
        {filtered.length === 0 && bookmarkedOnly && (
          <p className="text-sm opacity-60">No bookmarks yet — tap the bookmark button on any topic to save it here.</p>
        )}
        {filtered.length === 0 && !bookmarkedOnly && (
          <p className="text-sm opacity-60">No topics match &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}
