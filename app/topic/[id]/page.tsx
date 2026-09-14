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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/browse" className="text-sm opacity-60 hover:underline">
        ← Back to browse
      </Link>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-emerald-600">
        {topic.chapterTitle}
      </p>
      <h1 className="mt-1 text-xl font-semibold">{topic.sectionTitle}</h1>
      <p className="mt-1 text-xs opacity-50">
        Topic {topic.index + 1} of {TOTAL_TOPICS}
      </p>

      <div className="mt-6">
        <TopicText text={topic.text} />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => (done ? markIncomplete(topic.id) : markComplete(topic.id))}
          className={`rounded-full px-5 py-2 text-sm font-medium ${
            done
              ? "border border-emerald-600 text-emerald-600"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {done ? "Completed ✓ (undo)" : "Mark as done"}
        </button>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-4 text-sm dark:border-white/10">
        {prev ? (
          <Link href={`/topic/${prev.id}`} className="hover:underline">
            ← {prev.sectionTitle}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/topic/${next.id}`} className="text-right hover:underline">
            {next.sectionTitle} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
