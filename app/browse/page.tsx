"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { groupByChapter } from "@/lib/topics";
import { useProgress } from "@/lib/useProgress";

const CHAPTERS = groupByChapter();

export default function Browse() {
  const { isTopicComplete, todaysTopic } = useProgress();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHAPTERS;
    return CHAPTERS.map((chapter) => ({
      ...chapter,
      topics: chapter.topics.filter(
        (t) =>
          t.sectionTitle.toLowerCase().includes(q) ||
          t.chapterTitle.toLowerCase().includes(q) ||
          t.text.toLowerCase().includes(q)
      ),
    })).filter((chapter) => chapter.topics.length > 0);
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold">Browse all topics</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chapters, sections, or drug names…"
        className="mb-6 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-white/10"
      />

      <div className="space-y-3">
        {filtered.map((chapter) => {
          const doneCount = chapter.topics.filter((t) => isTopicComplete(t.id)).length;
          const hasToday = chapter.topics.some((t) => t.id === todaysTopic?.id);
          const open = searching || hasToday;
          return (
            <details
              key={chapter.chapterIndex}
              open={open}
              className="group rounded-lg border border-black/10 dark:border-white/10"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide opacity-70 marker:content-none">
                <span className="flex items-center gap-2">
                  <span className="text-[10px] opacity-50 transition-transform group-open:rotate-90">
                    ▶
                  </span>
                  {chapter.chapterTitle}
                </span>
                <span className="shrink-0 normal-case tracking-normal opacity-60">
                  {doneCount}/{chapter.topics.length}
                </span>
              </summary>
              <ul className="divide-y divide-black/5 border-t border-black/10 dark:divide-white/5 dark:border-white/10">
                {chapter.topics.map((topic) => {
                  const done = isTopicComplete(topic.id);
                  const isToday = todaysTopic?.id === topic.id;
                  return (
                    <li key={topic.id}>
                      <Link
                        href={`/topic/${topic.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              done
                                ? "bg-emerald-600 text-white"
                                : "border border-black/20 dark:border-white/20"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </span>
                          {topic.sectionTitle}
                        </span>
                        {isToday && (
                          <span className="shrink-0 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
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
        {filtered.length === 0 && (
          <p className="text-sm opacity-60">No topics match &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}
