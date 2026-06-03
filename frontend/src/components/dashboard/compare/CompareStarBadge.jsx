import StarRatingDisplay from "../../ui/StarRatingDisplay.jsx";

export default function CompareStarBadge({ rating, size = "md" }) {
  if (rating == null || Number.isNaN(Number(rating))) {
    return <span className="text-sm font-black text-slate-300 dark:text-slate-600">—</span>;
  }

  const pillClass = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const starClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <StarRatingDisplay
      rating={rating}
      variant="pill"
      className={pillClass}
      starClassName={starClass}
      numericClassName="text-[11px] font-black tabular-nums text-amber-700 dark:text-amber-300"
    />
  );
}
