export default function ReviewRatingDistribution({ distribution, reviewCount }) {
  const total = reviewCount || 0;
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2">
      {stars.map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2.5 text-xs">
            <span className="w-4 font-black text-amber-500">{star}</span>
            <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-10 text-right font-semibold tabular-nums text-slate-500 dark:text-slate-400">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
