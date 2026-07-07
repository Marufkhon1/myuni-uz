import ReviewSortSelect from "@/components/reviews/ReviewSortSelect.jsx";
import ReviewRatingFilterGroup from "@/components/reviews/ReviewRatingFilterGroup.jsx";
import { buildReviewFeedSummary } from "@/utils/reviewFeedSummary.js";

const SORT_OPTIONS = [
  { id: "likes", label: "Eng foydali" },
  { id: "rating", label: "Eng yuqori baho" },
  { id: "newest", label: "Eng yangi" },
];

export default function PopularReviewsToolbar({
  sortId,
  onSortChange,
  ratingFilter,
  onRatingFilterChange,
  filteredCount,
  totalCount,
  showClearFilters,
}) {
  const summary = buildReviewFeedSummary({
    filteredCount,
    totalCount,
    ratingFilter,
    sortLabel: SORT_OPTIONS.find((option) => option.id === sortId)?.label ?? SORT_OPTIONS[0].label,
  });

  return (
    <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Saralash
          </p>
          <ReviewSortSelect options={SORT_OPTIONS} value={sortId} onChange={onSortChange} compact />
        </div>

        <div className="min-w-0 flex-1 sm:max-w-md">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Baho bo&apos;yicha
          </p>
          <ReviewRatingFilterGroup value={ratingFilter} onChange={onRatingFilterChange} />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-600 dark:text-slate-300">{summary}</p>
        {showClearFilters && (
          <button
            type="button"
            onClick={() => {
              onSortChange("likes");
              onRatingFilterChange("all");
            }}
            className="text-xs font-bold text-primary hover:underline dark:text-blue-300 dark:hover:text-blue-200"
          >
            Tozalash
          </button>
        )}
      </div>
    </div>
  );
}
