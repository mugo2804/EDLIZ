"use client";

import { useState } from "react";
import { Copy, Check, Bookmark } from "lucide-react";
import { useReaderFontScale } from "@/lib/useReaderFontScale";
import { useBookmarks } from "@/lib/useBookmarks";
import { formatTopicTextPlain } from "@/lib/formatTopicText";

const SCALE_LABELS = ["S", "M", "L"] as const;

export function ReaderToolbar({
  topicId,
  chapterTitle,
  sectionTitle,
  text,
}: {
  topicId: string;
  chapterTitle: string;
  sectionTitle: string;
  text: string;
}) {
  const { scale, setScale } = useReaderFontScale();
  const { isBookmarked, toggle } = useBookmarks();
  const [copied, setCopied] = useState(false);
  const bookmarked = isBookmarked(topicId);

  async function copy() {
    const plain = `${chapterTitle} — ${sectionTitle}\nEDLIZ 2025\n\n${formatTopicTextPlain(text)}`;
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access denied/unavailable -- silently no-op, button just won't confirm
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-0.5 rounded-full border border-teal-900/10 bg-white p-0.5 dark:border-white/10 dark:bg-white/5">
        {([0, 1, 2] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            aria-label={`Text size ${SCALE_LABELS[s]}`}
            aria-pressed={scale === s}
            className={`h-6 w-6 rounded-full font-semibold transition-colors ${
              scale === s ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-50 dark:text-teal-200"
            }`}
          >
            {SCALE_LABELS[s]}
          </button>
        ))}
      </div>

      <button
        onClick={copy}
        className="flex items-center gap-1.5 rounded-full border border-teal-900/10 bg-white px-3 py-1.5 font-medium text-teal-800 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-teal-200"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>

      <button
        onClick={() => toggle(topicId)}
        aria-pressed={bookmarked}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium transition-colors ${
          bookmarked
            ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
            : "border-teal-900/10 bg-white text-teal-800 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-teal-200"
        }`}
      >
        <Bookmark size={13} className={bookmarked ? "fill-current" : ""} />
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
    </div>
  );
}
