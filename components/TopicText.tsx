import { formatTopicText } from "@/lib/formatTopicText";

export function TopicText({ text }: { text: string }) {
  const blocks = formatTopicText(text);

  return (
    <div className="text-[15.5px] leading-[1.75] text-teal-950/90 dark:text-teal-50/90 sm:text-base sm:leading-[1.8]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3
                key={i}
                className="mb-3 mt-9 text-lg font-bold text-teal-900 first:mt-0 dark:text-teal-100 sm:text-xl"
              >
                {block.text}
              </h3>
            );
          case "subheading":
            return (
              <h4
                key={i}
                className="mb-2 mt-6 text-[15px] font-semibold text-teal-700 first:mt-0 dark:text-teal-300 sm:text-base"
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
