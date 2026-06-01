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
      className="inline-flex items-center rounded-full bg-white px-3 py-1 shadow-sm dark:bg-white/10"
      starClassName="text-base leading-none tracking-tight"
      numericClassName="ml-2 text-xs font-black text-slate-500 dark:text-slate-400"
    />
  );
}
