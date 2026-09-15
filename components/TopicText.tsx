import { formatTopicText } from "@/lib/formatTopicText";
import type { FontScale } from "@/lib/useReaderFontScale";

const SIZES: Record<FontScale, { body: string; h3: string; h4: string }> = {
  0: { body: "text-[14px] leading-[1.7]", h3: "text-base sm:text-lg", h4: "text-sm" },
  1: {
    body: "text-[15.5px] leading-[1.75] sm:text-base sm:leading-[1.8]",
    h3: "text-lg sm:text-xl",
    h4: "text-[15px] sm:text-base",
  },
  2: { body: "text-[18px] leading-[1.8] sm:text-lg sm:leading-[1.85]", h3: "text-xl sm:text-2xl", h4: "text-lg" },
};

export function TopicText({ text, scale = 1 }: { text: string; scale?: FontScale }) {
  const blocks = formatTopicText(text);
  const sizes = SIZES[scale];

  return (
    <div className={`${sizes.body} text-teal-950/90 dark:text-teal-50/90`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3
                key={i}
                id={`block-${i}`}
                className={`mb-3 mt-9 scroll-mt-24 font-bold text-teal-900 first:mt-0 dark:text-teal-100 ${sizes.h3}`}
              >
                {block.text}
              </h3>
            );
          case "subheading":
            return (
              <h4
                key={i}
                id={`block-${i}`}
                className={`mb-2 mt-6 scroll-mt-24 font-semibold text-teal-700 first:mt-0 dark:text-teal-300 ${sizes.h4}`}
              >
                {block.text}
              </h4>
            );
          case "ol":
            return (
              <ol key={i} className="mb-4 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-teal-600 dark:marker:text-teal-300">
                {block.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    {item}
                  </li>
                ))}
              </ol>
            );
          case "ul":
            return (
              <ul key={i} className="mb-4 list-disc space-y-2 pl-5 marker:text-teal-500">
                {block.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "p":
          default:
            return (
              <p key={i} className="mb-4">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
