import { REVIEW_ASPECTS } from "../../utils/reviewAspects.js";

/** Yelp Review Insights — mezon bo'yicha tez ko'rish */
export default function ReviewAspectInsights({ averages, onSelectAspect }) {
  if (!averages?.review_count) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REVIEW_ASPECTS.map((aspect) => {
        const value = averages[aspect.id] ?? averages[aspect.key];
        if (value == null) {
          return null;
        }
        const score = Number.isInteger(value) ? value : Number(value).toFixed(1);
        const percent = Math.round((value / 5) * 100);

        return (
          <button
            key={aspect.id}
            type="button"
            onClick={() => onSelectAspect?.(aspect.id)}
            className="group inline-flex min-w-[8.5rem] flex-1 flex-col rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/35 sm:min-w-[9.5rem] sm:flex-none"
          >
            <span className="flex items-center gap-1.5 text-sm">
              <span aria-hidden="true">{aspect.icon}</span>
              <span className="font-bold text-slate-800 dark:text-white">{aspect.label}</span>
            </span>
            <span className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{score}</span>
              <span className="text-xs font-semibold text-slate-400">/ 5</span>
            </span>
            <span className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
