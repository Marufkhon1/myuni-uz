import StarRatingDisplay from "../../ui/StarRatingDisplay.jsx";

export default function CompareStarBadge({ rating, size = "md" }) {
  const pillClass = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const starClass = size === "sm" ? "text-xs" : "text-sm";

  if (rating == null || Number.isNaN(Number(rating))) {
    return (
      <span
        className={`inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-white ring-1 ring-slate-200/80 dark:bg-white/[0.06] dark:ring-white/10 ${pillClass} min-h-[2.35rem] min-w-[3.25rem]`}
      >
        <span className={`${starClass} leading-none text-slate-300 dark:text-slate-600`} aria-hidden="true">
          ★★★★★
        </span>
        <span className="text-[10px] font-black tabular-nums text-slate-400 dark:text-slate-500">—/5</span>
      </span>
    );
  }

  return (
    <StarRatingDisplay
      rating={rating}
      variant="card"
      className={pillClass}
      starClassName={starClass}
      filledStarClassName="text-amber-400"
      emptyStarClassName="text-slate-300"
      numericClassName="text-[10px] font-black tabular-nums text-amber-950"
    />
  );
}
