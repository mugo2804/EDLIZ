export function StatCircle({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-lg font-bold text-white shadow-md shadow-teal-900/20 sm:h-24 sm:w-24 sm:text-xl">
        {value}
      </div>
      <div className="max-w-[7rem] text-xs font-medium leading-tight opacity-60">{label}</div>
    </div>
  );
}
