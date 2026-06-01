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
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {stars.map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        const isActive = activeFilter === String(star);

        const bar = (
          <>
            <span
              className={`shrink-0 font-bold tabular-nums ${
                compact ? "w-3 text-[11px]" : "w-4 text-xs"
              } ${isActive ? "text-amber-600 dark:text-amber-400" : "text-amber-500"}`}
            >
              {star}
            </span>
            <div
              className={`min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 ${
                compact ? "h-2" : "h-2.5"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-amber-300/90 to-amber-400/90"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span
              className={`shrink-0 text-right font-semibold tabular-nums text-slate-500 dark:text-slate-400 ${
                compact ? "w-8 text-[10px]" : "w-10 text-xs"
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
              className={`flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-left transition ${
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
          <div key={star} className="flex items-center gap-2">
            {bar}
          </div>
        );
      })}
    </div>
  );
}
