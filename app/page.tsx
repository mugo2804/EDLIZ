"use client";

import Link from "next/link";
import { useProgress } from "@/lib/useProgress";
import { TopicText } from "@/components/TopicText";

export default function Home() {
  const {
    streak,
    completedToday,
    completedCount,
    totalTopics,
    todaysTopic,
    isComplete,
    markComplete,
  } = useProgress();

  const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-6 text-sm">
        <div>
          <div className="text-2xl font-semibold">{streak}</div>
          <div className="opacity-60">day streak</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">
            {completedCount}/{totalTopics}
          </div>
          <div className="opacity-60">topics done</div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 opacity-60">{pct}% of EDLIZ 2025 covered</div>
        </div>
      </div>

      {isComplete && (
        <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-6 text-center">
          <p className="text-lg font-medium">You&apos;ve been through every topic in EDLIZ.</p>
          <p className="mt-1 text-sm opacity-70">
            Revisit anything from the <Link href="/browse" className="underline">browse</Link> page whenever you need
            a refresher.
          </p>
        </div>
      )}

      {!isComplete && todaysTopic && (
        <div className="rounded-xl border border-black/10 p-6 dark:border-white/10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide opacity-60">
              {completedToday ? "Bonus topic" : "Today's topic"}
            </span>
            <span className="text-xs opacity-50">
              Topic {todaysTopic.index + 1} of {totalTopics}
            </span>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            {todaysTopic.chapterTitle}
          </p>
          <h1 className="mt-1 text-xl font-semibold">{todaysTopic.sectionTitle}</h1>

          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-1">
            <TopicText text={todaysTopic.text} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => markComplete(todaysTopic.id)}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Mark as done
            </button>
            <Link
              href={`/topic/${todaysTopic.id}`}
              className="text-sm opacity-70 hover:underline"
            >
              Open full page
            </Link>
          </div>
        </div>
      )}

      {completedToday && !isComplete && (
        <p className="mt-4 text-center text-sm opacity-60">
          You&apos;ve kept your streak alive today. Come back tomorrow for the next topic, or keep going now.
        </p>
      )}
    </div>
  );
}
