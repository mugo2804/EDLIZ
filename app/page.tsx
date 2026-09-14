"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, BookOpenText, TrendingUp, ArrowRight } from "lucide-react";
import { useProgress } from "@/lib/useProgress";
import { StatCircle } from "@/components/StatCircle";
import { groupByChapter, TOTAL_TOPICS } from "@/lib/topics";

const CHAPTERS = groupByChapter();
const CHAPTER_PREVIEW = CHAPTERS.slice(0, 10);

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

export default function Home() {
  const { todaysTopic, streak, completedCount } = useProgress();

  return (
    <div>
      {/* Hero */}
      <div className="overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 sm:rounded-b-[3.5rem]">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pb-24 pt-10 sm:flex-row sm:gap-4 sm:pb-28 sm:pt-16">
          <div className="max-w-lg text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
              EDLIZ 2025 &middot; Zimbabwe Essential Medicines &amp; STGs
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Learn the guidelines, one topic a day.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-teal-100 sm:text-base">
              {TOTAL_TOPICS} sections of Zimbabwe&apos;s Essential Medicines List and Standard Treatment
              Guidelines, worked through a little at a time — so it actually sticks.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <Link
                href="/today"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-50"
              >
                {completedCount > 0 ? "Continue today's topic" : "Start today's topic"}
              </Link>
              <Link
                href="/browse"
                className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Browse all topics
              </Link>
            </div>
          </div>
          <Image
            src="/illustrations/hero.svg"
            alt=""
            width={480}
            height={420}
            unoptimized
            className="h-auto w-64 shrink-0 sm:w-72 md:w-80"
          />
        </div>
      </div>

      {/* Today's topic teaser, overlapping the hero */}
      {todaysTopic && (
        <div className="mx-auto -mt-14 max-w-xl px-4 sm:-mt-16">
          <Link
            href="/today"
            className="flex items-center gap-4 rounded-2xl border border-teal-900/10 bg-white p-5 shadow-lg shadow-teal-900/10 transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-teal-950"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
                {completedCount > 0 ? "Your next topic" : "Your first topic"}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-teal-950 dark:text-teal-50">
                {todaysTopic.sectionTitle}
              </p>
              <p className="truncate text-xs opacity-60">{todaysTopic.chapterTitle}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      )}

      {/* Features */}
      <div className="mx-auto mt-16 max-w-5xl px-4 sm:mt-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-teal-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600/10 text-teal-600 dark:text-teal-300">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold text-teal-950 dark:text-teal-50">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed opacity-70">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats + chapter preview */}
      <div className="mx-auto mt-16 max-w-5xl px-4 sm:mt-20">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-6">
          <div>
            <h2 className="text-xl font-bold text-teal-950 dark:text-teal-50 sm:text-2xl">
              See what&apos;s inside
            </h2>
            <p className="mt-2 text-sm leading-relaxed opacity-70">
              Every chapter of EDLIZ 2025, from antimicrobial prescribing to poisoning to palliative
              care. Jump to any of them from Browse, or let the daily topic carry you through in
              order.
            </p>
            <div className="mt-6 flex justify-center gap-8 sm:justify-start">
              <StatCircle value={String(CHAPTERS.length)} label="chapters" />
              <StatCircle value={String(TOTAL_TOPICS)} label="topics" />
              <StatCircle value={streak > 0 ? String(streak) : "1"} label={streak > 0 ? "day streak" : "topic / day"} />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-2xl border border-teal-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <ul className="divide-y divide-teal-900/5 dark:divide-white/5">
              {CHAPTER_PREVIEW.map((chapter) => (
                <li key={chapter.chapterIndex}>
                  <Link
                    href={`/topic/${chapter.topics[0].id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-teal-50 dark:hover:bg-white/[0.04]"
                  >
                    <span className="truncate text-teal-950 dark:text-teal-50">{chapter.chapterTitle}</span>
                    <span className="shrink-0 pl-3 text-xs opacity-50">{chapter.topics.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mx-auto mt-16 max-w-5xl px-4 pb-16 sm:mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 px-6 py-12 text-center sm:px-12">
          <Image
            src="/illustrations/pulse-band.svg"
            alt=""
            fill
            unoptimized
            className="pointer-events-none object-cover"
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready for today&apos;s topic?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-teal-100">
              It takes a couple of minutes. Do it now, and your streak starts today.
            </p>
            <Link
              href="/today"
              className="mt-6 inline-block rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
            >
              Go to today&apos;s topic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
