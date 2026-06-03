import { buildCompareBreakdown } from "../../../utils/compareMath.js";
import { COMPARE_BREAKDOWN_KEYS, COMPARE_METRICS } from "../../../utils/compareRoleContent.js";

const METRIC_ICONS = Object.fromEntries(
  COMPARE_METRICS.filter((metric) => metric.icon).map((metric) => [metric.key, metric.icon])
);
const BREAKDOWN_KEY_SET = new Set(COMPARE_BREAKDOWN_KEYS);

export default function CompareWinsBreakdown({ universities }) {
  const rows = buildCompareBreakdown(universities)
    .filter((row) => BREAKDOWN_KEY_SET.has(row.key) && row.status === "win")
    .map((row) => ({
      ...row,
      icon: row.icon || METRIC_ICONS[row.key],
    }));

  if (!rows.length) {
    return null;
  }

  const nameById = Object.fromEntries(
    universities.map((university) => [university.id, university.short_name || university.name])
  );

  const visibleWinCounts = Object.fromEntries(universities.map((university) => [university.id, 0]));
  rows.forEach((row) => {
    if (row.winnerId != null) {
      visibleWinCounts[row.winnerId] += 1;
    }
  });

  const hasVisibleWins = universities.some((university) => visibleWinCounts[university.id] > 0);

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Qaysi ko&apos;rsatkichda kim oldin?</p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50/80 px-3 py-2 text-sm dark:bg-white/[0.04]"
          >
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {row.icon && (
                <span className="mr-1" aria-hidden="true">
                  {row.icon}
                </span>
              )}
              {row.label}
            </span>
            <span className="font-black text-emerald-700 dark:text-emerald-400">
              {nameById[row.winnerId]}
            </span>
          </li>
        ))}
      </ul>
      {hasVisibleWins && (
        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          Asosiy ko&apos;rsatkichlar:{" "}
          {universities
            .filter((university) => visibleWinCounts[university.id] > 0)
            .map((university) => `${university.short_name} ${visibleWinCounts[university.id]}`)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
