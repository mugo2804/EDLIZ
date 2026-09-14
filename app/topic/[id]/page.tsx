"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic, getAdjacentTopics, TOTAL_TOPICS } from "@/lib/topics";
import { useProgress } from "@/lib/useProgress";
import { TopicText } from "@/components/TopicText";

export default function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topic = getTopic(id);
  const { isTopicComplete, markComplete, markIncomplete } = useProgress();

  if (!topic) notFound();

  const { prev, next } = getAdjacentTopics(id);
  const done = isTopicComplete(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/browse" className="text-sm text-teal-700 hover:underline dark:text-teal-300">
        ← Back to browse
      </Link>

      <div className="mt-6 rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
            {topic.chapterTitle}
          </p>
          <p className="text-xs opacity-50">
            Topic {topic.index + 1} of {TOTAL_TOPICS}
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-teal-950 dark:text-teal-50">{topic.sectionTitle}</h1>

        <div className="mt-6">
          <TopicText text={topic.text} />
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-teal-900/10 pt-6 dark:border-white/10">
          <button
            onClick={() => (done ? markIncomplete(topic.id) : markComplete(topic.id))}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              done
                ? "border border-teal-600 text-teal-700 hover:bg-teal-50 dark:text-teal-300"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {done ? "Completed ✓ (undo)" : "Mark as done"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        {prev ? (
          <Link
            href={`/topic/${prev.id}`}
            className="max-w-[45%] truncate rounded-full border border-teal-900/10 bg-white px-4 py-2 text-teal-800 shadow-sm hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-teal-200"
          >
            ← {prev.sectionTitle}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/topic/${next.id}`}
            className="max-w-[45%] truncate rounded-full border border-teal-900/10 bg-white px-4 py-2 text-right text-teal-800 shadow-sm hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-teal-200"
          >
            {next.sectionTitle} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
