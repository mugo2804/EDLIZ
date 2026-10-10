import { Snowflake } from "lucide-react";

export function StatCircle({
  value,
  label,
  freezeBadge,
}: {
  value: string;
  label: string;
  freezeBadge?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-lg font-bold text-white shadow-md shadow-teal-900/20 sm:h-24 sm:w-24 sm:text-xl">
        {value}
        {Boolean(freezeBadge) && (
          <span
            title={`${freezeBadge} streak freeze${freezeBadge === 1 ? "" : "s"} available`}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-400 text-white shadow-sm dark:border-teal-950"
          >
            <Snowflake size={12} />
          </span>
        )}
      </div>
      <div className="max-w-[7rem] text-xs font-medium leading-tight opacity-60">{label}</div>
    </div>
  );
}
