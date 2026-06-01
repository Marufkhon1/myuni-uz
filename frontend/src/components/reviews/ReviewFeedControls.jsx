import ReviewSortSelect from "./ReviewSortSelect.jsx";
import { formatStarFilterLabel } from "../../utils/starRatingA11y.js";

const CONTROL_LABEL_CLASS = "mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400";

export function RatingFilterGroup({ value, onChange, compact = true }) {
  return (
    <div
      className="flex h-9 w-full flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Baho bo'yicha filtrlash"
    >
      {["all", "5", "4", "3", "2", "1"].map((ratingValue) => {
        const isStar = ratingValue !== "all";
        const isActive = value === ratingValue;

        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => onChange(ratingValue)}
            aria-pressed={isActive}
            aria-label={formatStarFilterLabel(ratingValue)}
            className={`inline-flex h-9 shrink-0 items-center rounded-full font-bold transition ${
              compact ? "px-3 text-[11px] sm:text-xs" : "px-3.5 py-1.5 text-xs"
            } ${
              isActive
                ? isStar
                  ? "bg-amber-400 text-amber-950 shadow-sm shadow-amber-400/30"
                  : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
            }`}
          >
            {ratingValue === "all" ? "Hammasi" : `${ratingValue} ★`}
          </button>
        );
      })}
    </div>
  );
}

export function ReviewFeedControls({
  sortOptions,
  sortId,
  onSortChange,
  ratingFilter,
  onRatingFilterChange,
  layout = "split",
}) {
  const isStacked = layout === "stack";

  if (isStacked) {
    return (
      <div className="flex min-w-0 w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-8 sm:gap-y-3">
        <div className="w-fit max-w-full">
          <p className={CONTROL_LABEL_CLASS}>Saralash</p>
          <ReviewSortSelect options={sortOptions} value={sortId} onChange={onSortChange} compact />
        </div>
        <div className="min-w-0 flex-1 sm:min-w-[12rem]">
          <p className={CONTROL_LABEL_CLASS}>Baho bo&apos;yicha</p>
          <RatingFilterGroup value={ratingFilter} onChange={onRatingFilterChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 w-full grid-cols-1 gap-x-6 gap-y-1.5 min-[720px]:grid-cols-[auto_minmax(0,1fr)] min-[720px]:items-center">
      <p className={`${CONTROL_LABEL_CLASS} min-[720px]:mb-0`}>Saralash</p>
      <p className={`${CONTROL_LABEL_CLASS} min-[720px]:mb-0`}>Baho bo&apos;yicha</p>
      <div className="w-fit max-w-full min-[720px]:justify-self-start">
        <ReviewSortSelect options={sortOptions} value={sortId} onChange={onSortChange} compact />
      </div>
      <RatingFilterGroup value={ratingFilter} onChange={onRatingFilterChange} />
    </div>
  );
}

export function buildReviewFeedSummary({ filteredCount, totalCount, ratingFilter, sortLabel }) {
  const isRatingFiltered = ratingFilter !== "all";
  const countLabel = isRatingFiltered
    ? `${filteredCount} ta mos sharh · jami ${totalCount} ta sharhdan`
    : `${totalCount} ta sharh`;

  return `${countLabel} · ${sortLabel}`;
}
