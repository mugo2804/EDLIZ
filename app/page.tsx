"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, BookOpenText, TrendingUp } from "lucide-react";
import { useProgress } from "@/lib/useProgress";
import { useReaderFontScale } from "@/lib/useReaderFontScale";
import { TopicText } from "@/components/TopicText";
import { TopicToc } from "@/components/TopicToc";
import { ReaderToolbar } from "@/components/ReaderToolbar";
import { StatCircle } from "@/components/StatCircle";
import { MasteryGrid } from "@/components/MasteryGrid";
import { BackgroundNote } from "@/components/BackgroundNote";
import { formatTopicTextPlain } from "@/lib/formatTopicText";
import { groupByChapter, TOTAL_TOPICS } from "@/lib/topics";

const CHAPTERS = groupByChapter();

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "A topic a day",
    body: "Small, steady doses beat cramming. One section at a time, in the guideline's own order.",
  },
  {
    icon: BookOpenText,
    title: "The real EDLIZ text",
    body: "No summaries or paraphrasing — every word is straight from the official EDLIZ 2025 document.",
  },
  {
    icon: TrendingUp,
    title: "Streaks that stick",
    body: "Your streak and progress are saved right in your browser, so a habit actually builds up.",
  },
];

export default function Dashboard() {
  const {
    streak,
    freezesRemaining,
    completedToday,
    completedCount,
    totalTopics,
    todaysTopic,
    isComplete,
    markComplete,
  } = useProgress();
  const { scale } = useReaderFontScale();
  const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 pb-16 pt-10 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 sm:flex-row sm:gap-8">
          <div className="min-w-0 flex-1 text-center sm:text-left">
            {isComplete ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
                  EDLIZ 2025 &middot; complete
                </p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">You&apos;ve covered every topic.</h1>
                <p className="mt-3 text-sm text-teal-100">
                  All {totalTopics} sections of the guideline, done. Head to{" "}
                  <Link href="/browse" className="underline">
                    Browse
                  </Link>{" "}
                  any time you need a refresher.
                </p>
              </>
            ) : (
              todaysTopic && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
                      {completedToday ? "Bonus topic" : "Today's topic"}
                    </p>
                    <p className="shrink-0 text-xs text-teal-200">
                      Topic {todaysTopic.index + 1} of {totalTopics}
                    </p>
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-teal-200">
                    {todaysTopic.chapterTitle}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{todaysTopic.sectionTitle}</h1>
                  <p className="mt-3 text-sm text-teal-200">
                    One topic a day from EDLIZ 2025 — Zimbabwe&apos;s Essential Medicines &amp; STGs.
                  </p>
                </>
              )
            )}
          </div>
          <Image
            src="/illustrations/hero.svg"
            alt=""
            width={480}
            height={420}
            unoptimized
            className="h-auto w-40 shrink-0 sm:w-48"
          />
        </div>
      </div>

      {/* Stat circles, overlapping the hero */}
      <div className="mx-auto -mt-10 flex max-w-3xl justify-center gap-6 px-4 sm:gap-10">
        <StatCircle value={String(streak)} label="day streak" freezeBadge={freezesRemaining} />
        <StatCircle value={`${completedCount}/${totalTopics}`} label="topics done" />
        <StatCircle value={`${pct}%`} label="of EDLIZ covered" />
      </div>

      {/* Content card */}
      <div className="mx-auto max-w-3xl px-4 py-10">
        {!isComplete && todaysTopic && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-10">
            <div className="sticky top-20 z-10 -mx-6 bg-white/95 px-6 py-2 backdrop-blur dark:bg-teal-950/95 sm:-mx-10 sm:px-10">
              <ReaderToolbar
                topicId={todaysTopic.id}
                chapterTitle={todaysTopic.chapterTitle}
                sectionTitle={todaysTopic.sectionTitle}
                text={todaysTopic.text}
              />
            </div>
            <div className="mt-4">
              <TopicToc text={todaysTopic.text} />
              <TopicText text={todaysTopic.text} scale={scale} />
            </div>

            <BackgroundNote
              topicId={todaysTopic.id}
              chapterTitle={todaysTopic.chapterTitle}
              sectionTitle={todaysTopic.sectionTitle}
              sourceText={formatTopicTextPlain(todaysTopic.text)}
            />

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-teal-900/10 pt-6 dark:border-white/10">
              <button
                onClick={() => markComplete(todaysTopic.id)}
                className="rounded-full bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                Mark as done
              </button>
              <Link
                href={`/topic/${todaysTopic.id}`}
                className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
              >
                Open full page
              </Link>
            </div>
          </div>
        )}

        {completedToday && !isComplete && (
          <p className="mt-6 text-center text-sm opacity-60">
            You&apos;ve kept your streak alive today. Come back tomorrow for the next topic, or keep going now.
          </p>
        )}

        {isComplete && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-teal-900/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-lg font-medium">Nice work seeing the whole guideline through.</p>
            <p className="mt-1 text-sm opacity-70">
              Use <Link href="/browse" className="underline">Browse</Link> to revisit anything, any time.
            </p>
          </div>
        )}
      </div>

      {/* Supplementary: why this app + mastery grid */}
      <div className="mx-auto mt-4 max-w-3xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600/10 text-teal-600 dark:text-teal-300">
                <Icon size={17} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-teal-950 dark:text-teal-50">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed opacity-70">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
              Mastery grid — one square per chapter
            </p>
            <p className="shrink-0 text-xs opacity-50">
              {CHAPTERS.length} chapters &middot; {TOTAL_TOPICS} topics
            </p>
          </div>
          <div className="mt-3">
            <MasteryGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
