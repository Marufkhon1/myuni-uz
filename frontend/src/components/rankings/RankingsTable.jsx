import { Link } from "react-router-dom";
import { CONFIDENCE_LABELS, RANKINGS_MIN_REVIEWS } from "@/config/rankings.js";
import { buildUniversityPublicPath } from "@/utils/navigation.js";

function scoreOf(row) {
  const value = row.display_rating ?? row.bayesian_rating ?? row.average_rating;
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(1);
}

function confidenceLabel(row) {
  return CONFIDENCE_LABELS[row.rating_confidence] || CONFIDENCE_LABELS.low;
}

/**
 * Soft reyting jadvali — interaction table (not card soup).
 */
export default function RankingsTable({ rows = [], year }) {
  if (!rows.length) {
    return (
      <p className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
        Hozircha kamida {RANKINGS_MIN_REVIEWS} ta tasdiqlangan sharh bo&apos;lgan universitet yo&apos;q.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.04]">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          MyUni soft reyting {year} — Bayesian tartib
        </caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
            <th scope="col" className="px-4 py-3 sm:px-5">
              #
            </th>
            <th scope="col" className="px-4 py-3 sm:px-5">
              Universitet
            </th>
            <th scope="col" className="px-4 py-3 sm:px-5">
              Shahar
            </th>
            <th scope="col" className="px-4 py-3 text-right sm:px-5">
              Soft ball
            </th>
            <th scope="col" className="px-4 py-3 text-right sm:px-5">
              Sharhlar
            </th>
            <th scope="col" className="px-4 py-3 sm:px-5">
              Ishonch
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const path = buildUniversityPublicPath(row) || `/universitet/${row.slug}`;
            return (
              <tr
                key={row.id || row.slug}
                className="border-b border-slate-100 last:border-0 dark:border-white/5"
              >
                <td className="whitespace-nowrap px-4 py-3.5 font-black text-slate-400 sm:px-5">
                  {index + 1}
                </td>
                <td className="max-w-[18rem] px-4 py-3.5 sm:px-5">
                  <Link
                    to={path}
                    className="font-bold text-slate-950 transition hover:text-primary dark:text-white dark:hover:text-blue-200"
                  >
                    {row.name}
                  </Link>
                  {row.short_name && row.short_name !== row.name ? (
                    <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                      {row.short_name}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300 sm:px-5">
                  {row.city || row.location || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-black text-primary sm:px-5">
                  {scoreOf(row)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-200 sm:px-5">
                  {row.review_count ?? 0}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 sm:px-5">
                  <span
                    className={
                      "inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide " +
                      (row.rating_confidence === "high"
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200"
                        : row.rating_confidence === "medium"
                          ? "bg-amber-50 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100"
                          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300")
                    }
                  >
                    {confidenceLabel(row)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
