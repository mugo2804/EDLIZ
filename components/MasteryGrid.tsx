"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { groupByChapter } from "@/lib/topics";
import { useProgress } from "@/lib/useProgress";

const CHAPTERS = groupByChapter();

export function MasteryGrid() {
  const { isTopicComplete } = useProgress();

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {CHAPTERS.map((chapter) => {
        const done = chapter.topics.filter((t) => isTopicComplete(t.id)).length;
        const total = chapter.topics.length;
        const pct = total > 0 ? done / total : 0;
        const complete = total > 0 && done === total;

        return (
          <Link
            key={chapter.chapterIndex}
            href={`/topic/${chapter.topics[0].id}`}
            title={`${chapter.chapterTitle} — ${done}/${total}`}
            aria-label={`${chapter.chapterTitle}: ${done} of ${total} topics complete`}
            className={`group relative aspect-square overflow-hidden rounded-md transition-transform hover:scale-105 ${
              pct > 0
                ? "border border-teal-900/10 bg-teal-900/[0.04] dark:border-white/10 dark:bg-white/5"
                : "border border-dashed border-teal-900/20 bg-transparent dark:border-white/20"
            }`}
          >
            {pct > 0 && (
              <div
                className={`absolute inset-x-0 bottom-0 transition-all ${complete ? "bg-teal-600" : "bg-teal-400/70"}`}
                style={{ height: `${Math.max(pct * 100, 12)}%` }}
              />
            )}
            {complete && (
              <span className="absolute inset-0 flex items-center justify-center text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
