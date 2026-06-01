export default function ReviewInsightSummary({ summary, reviewCount, className = "", inline = false }) {
  if (!summary) {
    return null;
  }

  if (inline) {
    return (
      <div className={className}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Talabalar nima deyishadi</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{summary}</p>
        {reviewCount != null && reviewCount > 0 && (
          <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {reviewCount} ta sharh asosida xulosa
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/5 via-white to-violet-600/5 p-5 ring-1 ring-slate-200/70 dark:from-blue-400/10 dark:via-white/[0.02] dark:to-violet-400/5 dark:ring-white/10 sm:p-6 ${className}`}
    >
      <div className="absolute -right-4 -top-4 text-6xl opacity-[0.06]" aria-hidden="true">
        "
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Talabalar nima deyishadi</p>
      <p className="mt-3 text-[15px] leading-[1.8] text-slate-700 dark:text-slate-200">{summary}</p>
      {reviewCount != null && reviewCount > 0 && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200/60 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          {reviewCount} ta sharh asosida xulosa
        </p>
      )}
    </div>
  );
}
