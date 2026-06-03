import ReviewSortSelect from "./ReviewSortSelect.jsx";
import { formatStarFilterLabel } from "../../utils/starRatingA11y.js";

const CONTROL_LABEL_CLASS =
  "mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500";

const RATING_OPTIONS = ["all", "5", "4", "3", "2", "1"];

function RatingFilterButton({ ratingValue, isActive, compact, onClick }) {
  const isStar = ratingValue !== "all";
  const isAll = ratingValue === "all";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={formatStarFilterLabel(ratingValue)}
      className={`relative inline-flex shrink-0 items-center justify-center gap-1 rounded-lg font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        compact ? "h-8 min-w-[2.65rem] px-2.5 text-[11px] sm:min-w-[2.85rem] sm:px-3 sm:text-xs" : "min-w-[3rem] px-3.5 py-2 text-xs"
      } ${
        isActive
          ? isAll
            ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-[0_4px_14px_-4px_rgba(15,23,42,0.55)] dark:from-white dark:to-slate-100 dark:text-slate-900"
            : "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_14px_-4px_rgba(251,191,36,0.55)] ring-1 ring-amber-300/50"
          : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
      }`}
    >
      {isAll ? (
        "Hammasi"
      ) : (
        <>
          <span className="tabular-nums leading-none">{ratingValue}</span>
          <span
            className={`text-[11px] leading-none sm:text-xs ${
              isActive ? "text-amber-900/80" : "text-amber-500/70 dark:text-amber-400/55"
            }`}
            aria-hidden="true"
          >
            ★
          </span>
        </>
      )}
      {isActive && isStar && (
        <span
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/25"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function RatingFilterGroup({ value, onChange, compact = true }) {
  return (
    <div
      className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200/70 bg-slate-100/60 p-1 shadow-inner [scrollbar-width:none] dark:border-white/10 dark:bg-white/[0.04] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Baho bo'yicha filtrlash"
    >
      <div className="flex w-max min-w-full items-center gap-0.5 sm:gap-1">
        {RATING_OPTIONS.map((ratingValue) => (
          <RatingFilterButton
            key={ratingValue}
            ratingValue={ratingValue}
            isActive={value === ratingValue}
            compact={compact}
            onClick={() => onChange(ratingValue)}
          />
        ))}
      </div>
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
      <div className="grid min-w-0 w-full grid-cols-1 gap-4 min-[520px]:grid-cols-[12.5rem_minmax(0,1fr)] min-[520px]:items-end min-[520px]:gap-x-8">
        <div className="min-w-0">
          <p className={CONTROL_LABEL_CLASS}>Saralash</p>
          <ReviewSortSelect options={sortOptions} value={sortId} onChange={onSortChange} compact />
        </div>
        <div className="min-w-0">
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
