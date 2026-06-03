import { buildCompareBreakdown } from "../../../utils/compareMath.js";

export default function CompareWinsBreakdown({ universities, winCounts }) {
  const rows = buildCompareBreakdown(universities).filter((row) => row.status !== "insufficient");

  if (!rows.length) {
    return null;
  }

  const nameById = Object.fromEntries(
    universities.map((university) => [university.id, university.short_name || university.name])
  );

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
            {row.status === "win" ? (
              <span className="font-black text-emerald-700 dark:text-emerald-400">
                {nameById[row.winnerId]}
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400">Durang</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        Jami g&apos;alabalar:{" "}
        {universities
          .map((university) => `${university.short_name} ${winCounts[university.id] ?? 0}`)
          .join(" · ")}
      </p>
    </div>
  );
}
