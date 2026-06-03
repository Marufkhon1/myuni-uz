/**
 * «Foydali» — yorug'/qorong'u rejimda aniq kontrast, hoverda primary fill.
 */
export default function HelpfulLikeButton({
  item,
  onLike,
  label = "Foydali",
  className = "",
  shape = "pill",
}) {
  const count = item.helpful_count ?? item.like_count ?? 0;
  const liked = Boolean(item.liked_by_me);
  const rounded = shape === "pill" ? "rounded-full" : "rounded-xl";

  return (
    <button
      type="button"
      onClick={() => onLike?.(item.id)}
      aria-label={`${label}, ${count} ta`}
      aria-pressed={liked}
      className={`group inline-flex items-center gap-2 ${rounded} px-4 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-slate-900 ${
        liked
          ? "bg-primary text-white shadow-md shadow-primary/30 hover:bg-blue-600 hover:shadow-lg hover:shadow-primary/35"
          : `bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/90 hover:bg-primary hover:text-white hover:ring-primary/40 hover:shadow-md hover:shadow-primary/20 dark:bg-slate-800 dark:text-slate-100 dark:ring-white/15 dark:hover:bg-primary dark:hover:text-white dark:hover:ring-primary/45`
      } ${className}`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-sm leading-none transition-colors ${
          liked
            ? "bg-white/20"
            : "bg-slate-100 text-slate-600 group-hover:bg-white/20 group-hover:text-white dark:bg-white/10 dark:text-slate-200"
        }`}
        aria-hidden="true"
      >
        {liked ? "♥" : "♡"}
      </span>
      <span>{label}</span>
      <span
        className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-black tabular-nums transition-colors ${
          liked
            ? "bg-white/25 text-white"
            : "bg-primary/10 text-primary group-hover:bg-white/25 group-hover:text-white dark:bg-blue-400/15 dark:text-blue-200 dark:group-hover:bg-white/25 dark:group-hover:text-white"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
