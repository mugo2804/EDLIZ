import { getTocEntries } from "@/lib/formatTopicText";

// Long topics can have several structural headings; below that, a jump list
// is just clutter for what's usually already a short read.
const MIN_ENTRIES_TO_SHOW = 3;

export function TopicToc({ text }: { text: string }) {
  const entries = getTocEntries(text);
  if (entries.length < MIN_ENTRIES_TO_SHOW) return null;

  return (
    <div className="mb-6 rounded-xl border border-teal-900/10 bg-teal-50/60 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
        Jump to
      </p>
      <ul className="mt-2 space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`block truncate text-sm text-teal-800 hover:underline dark:text-teal-200 ${
                entry.level === "subheading" ? "pl-3 opacity-80" : ""
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
