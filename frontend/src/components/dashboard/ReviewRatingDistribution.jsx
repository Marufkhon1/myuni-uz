export default function ReviewRatingDistribution({
  distribution,
  reviewCount,
  activeFilter = "all",
  onFilterChange,
  compact = false,
}) {
  const total = reviewCount || 0;
  const stars = [5, 4, 3, 2, 1];
  const interactive = typeof onFilterChange === "function";

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      {stars.map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        const isActive = activeFilter === String(star);

        const bar = (
          <>
            <span
              className={`inline-flex w-7 shrink-0 items-center gap-0.5 font-black tabular-nums ${
                compact ? "text-[11px]" : "text-xs"
              } ${isActive ? "text-amber-600 dark:text-amber-400" : "text-amber-500 dark:text-amber-400/90"}`}
            >
              {star}
              <span className="text-[10px] leading-none opacity-80" aria-hidden="true">
                ★
              </span>
            </span>
            <div
              className={`relative min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10 ${
                compact ? "h-2" : "h-2.5"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.35)]"
                    : "bg-gradient-to-r from-amber-300/95 to-amber-400/90"
                }`}
                style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span
              className={`shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-center font-black tabular-nums text-slate-600 dark:bg-white/[0.06] dark:text-slate-300 ${
                compact ? "min-w-[1.75rem] text-[10px]" : "min-w-[2rem] text-xs"
              }`}
            >
              {count}
            </span>
          </>
        );

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onFilterChange(isActive ? "all" : String(star))}
              className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-all ${
                isActive
                  ? "bg-amber-50 ring-1 ring-amber-200/80 dark:bg-amber-400/10 dark:ring-amber-400/25"
                  : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              }`}
              aria-pressed={isActive}
              aria-label={`${star} yulduzli sharhlarni ko'rish`}
            >
              {bar}
            </button>
          );
        }

        return (
          <div key={star} className="flex items-center gap-2 px-0.5">
            {bar}
          </div>
        );
      })}
    </div>
  );
}
