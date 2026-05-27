export default function UniversityRatingStars({ rating }) {
  if (rating == null) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
        Hali baho yo'q
      </span>
    );
  }

  const filled = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-amber-400 shadow-sm dark:bg-white/10">
      <span aria-hidden="true" className="text-base leading-none tracking-tight">
        {"★".repeat(filled)}
      </span>
      <span className="ml-2 text-xs font-black text-slate-500 dark:text-slate-400">{rating}/5</span>
    </span>
  );
}
