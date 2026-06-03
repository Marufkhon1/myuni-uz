import StarRatingDisplay from "../ui/StarRatingDisplay.jsx";

export default function UniversityRatingStars({ rating }) {
  if (rating == null) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
        Hali baho yo&apos;q
      </span>
    );
  }

  return (
    <StarRatingDisplay
      rating={rating}
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 ring-1 ring-amber-200/70 dark:bg-amber-400/10 dark:ring-amber-400/20"
      starClassName="text-base leading-none text-amber-500 dark:text-amber-400"
      numericClassName="text-xs font-black tabular-nums text-amber-950 dark:text-amber-50"
    />
  );
}
