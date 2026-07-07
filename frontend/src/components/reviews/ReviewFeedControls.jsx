import ReviewSortSelect from "./ReviewSortSelect.jsx";
import ReviewRatingFilterGroup from "./ReviewRatingFilterGroup.jsx";

const CONTROL_LABEL_CLASS =
  "mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500";

export default function ReviewFeedControls({
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
          <ReviewRatingFilterGroup value={ratingFilter} onChange={onRatingFilterChange} />
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
      <ReviewRatingFilterGroup value={ratingFilter} onChange={onRatingFilterChange} />
    </div>
  );
}
