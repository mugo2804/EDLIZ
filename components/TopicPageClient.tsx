"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAdjacentTopics, TOTAL_TOPICS, type Topic } from "@/lib/topics";
import { useProgress } from "@/lib/useProgress";
import { useReaderFontScale } from "@/lib/useReaderFontScale";
import { TopicText } from "@/components/TopicText";
import { TopicToc } from "@/components/TopicToc";
import { ReaderToolbar } from "@/components/ReaderToolbar";
import { BackgroundNote } from "@/components/BackgroundNote";
import { formatTopicTextPlain } from "@/lib/formatTopicText";

export function TopicPageClient({ topic }: { topic: Topic }) {
  const { isTopicComplete, markComplete, markIncomplete } = useProgress();
  const { scale } = useReaderFontScale();

  const { prev, next } = getAdjacentTopics(topic.id);
  const done = isTopicComplete(topic.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-teal-700 dark:text-teal-300">
        <Link href="/browse" className="hover:underline">
          Browse
        </Link>
        <ChevronRight size={14} className="opacity-50" />
        <span className="truncate opacity-70">{topic.chapterTitle}</span>
      </nav>

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

        <div className="sticky top-20 z-10 -mx-6 mt-4 bg-white/95 px-6 py-2 backdrop-blur dark:bg-teal-950/95 sm:-mx-10 sm:px-10">
          <ReaderToolbar topicId={topic.id} chapterTitle={topic.chapterTitle} sectionTitle={topic.sectionTitle} text={topic.text} />
        </div>

        <div className="mt-6">
          <TopicToc text={topic.text} />
          <TopicText text={topic.text} scale={scale} />
        </div>

        <BackgroundNote
          topicId={topic.id}
          chapterTitle={topic.chapterTitle}
          sectionTitle={topic.sectionTitle}
          sourceText={formatTopicTextPlain(topic.text)}
        />

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
