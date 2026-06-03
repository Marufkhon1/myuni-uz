import { useMemo } from "react";
import UniversityAvatar from "../../UniversityAvatar.jsx";
import CompareStarBadge from "./CompareStarBadge.jsx";
import CompareMetricBar from "./CompareMetricBar.jsx";
import { COMPARE_SLOT_THEMES } from "./compareTheme.js";
import { COMPARE_ASPECTS, COMPARE_METRICS } from "../../../utils/compareRoleContent.js";
import { numericWinner, relativeBarPercents, rowHasDifference } from "../../../utils/compareMath.js";

function MatrixCell({ value, metricKey, format, isWinner, isAspect, barPercent, barClassName }) {
  const winnerClass = isWinner
    ? "rounded-xl bg-emerald-50/90 px-2 py-2 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:ring-emerald-400/25"
    : "px-2 py-2";

  if (isAspect || metricKey === "average_rating") {
    return (
      <div className={`flex flex-col items-center justify-center ${winnerClass}`}>
        <CompareStarBadge rating={value} size="sm" />
        {isWinner && <span className="mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Eng yuqori</span>}
      </div>
    );
  }

  const showBar = metricKey === "review_count" || metricKey === "member_count";

  return (
    <div className={`text-center ${winnerClass}`}>
      <span className="text-sm font-black tabular-nums sm:text-base">{format(value)}</span>
      {showBar && barPercent != null && (
        <CompareMetricBar percent={barPercent} barClassName={barClassName} />
      )}
      {isWinner && !showBar && (
        <span className="mt-1 block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓</span>
      )}
    </div>
  );
}

export default function CompareMatrix({
  universities,
  content,
  showAspects,
  differencesOnly,
  leaderId,
}) {
  const columnTemplate = useMemo(
    () => `minmax(8.5rem,1.15fr) repeat(${universities.length}, minmax(6.5rem, 1fr))`,
    [universities.length]
  );

  const metricRows = COMPARE_METRICS.filter((metric) => {
    if (!differencesOnly) {
      return true;
    }
    return rowHasDifference(universities.map((university) => university[metric.key]));
  });

  const aspectRows = showAspects
    ? COMPARE_ASPECTS.filter((aspect) => {
        if (!differencesOnly) {
          return true;
        }
        return rowHasDifference(
          universities.map((university) => university.aspect_averages?.[aspect.key])
        );
      })
    : [];

  if (metricRows.length === 0 && aspectRows.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-white/[0.03]">
        Barcha tanlangan OTMlar ko&apos;rsatkichlari bir xil — &quot;Faqat farqlar&quot; filtrini o&apos;chiring.
      </p>
    );
  }

  function renderRow(label, cells, key) {
    return (
      <div
        key={key}
        className="group grid items-stretch gap-0 border-b border-slate-100 transition hover:bg-slate-50/80 dark:border-white/10 dark:hover:bg-white/[0.02]"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <p className="sticky left-0 z-[1] flex items-center border-r border-slate-100 bg-white py-3.5 pl-1 pr-3 text-[11px] font-bold leading-snug text-slate-600 shadow-[inset_-8px_0_12px_-12px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#0b1220] dark:text-slate-300 dark:shadow-[inset_-8px_0_12px_-12px_rgba(0,0,0,0.5)]">
          {label}
        </p>
        {cells}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet matrix */}
      <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10 sm:block">
        <div className="overflow-x-auto">
          <div className="min-w-[28rem]">
            <div
              className="sticky top-0 z-20 grid gap-0 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1220]"
              style={{ gridTemplateColumns: columnTemplate }}
            >
              <p className="sticky left-0 z-[2] self-end border-r border-slate-100 bg-white px-1 pb-3 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-[#0b1220]">
                {content.metricsTitle}
              </p>
              {universities.map((university, index) => {
                const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
                const isLeader = leaderId != null && String(leaderId) === String(university.id);
                return (
                  <div
                    key={university.id}
                    className={`flex flex-col items-center gap-1.5 px-2 pb-3 pt-3 text-center ${
                      isLeader ? `${theme.column} ring-1 ring-inset ${theme.headerRing}` : ""
                    }`}
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <p className="line-clamp-2 text-[11px] font-black leading-tight text-slate-900 dark:text-white">
                      {university.short_name || university.name}
                    </p>
                    {isLeader && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase ${theme.matrixBadge}`}>
                        Tavsiya
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              {metricRows.map((metric) => {
                const values = universities.map((university) => university[metric.key]);
                const winnerIndex = numericWinner(values);
                const barPercents = relativeBarPercents(values);

                return renderRow(
                  metric.label,
                  universities.map((university, index) => {
                    const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
                    const isLeader = leaderId != null && String(leaderId) === String(university.id);
                    return (
                      <div
                        key={university.id}
                        className={isLeader ? theme.column : ""}
                      >
                        <MatrixCell
                          value={university[metric.key]}
                          metricKey={metric.key}
                          format={metric.format}
                          isWinner={winnerIndex === index}
                          isAspect={false}
                          barPercent={barPercents[index]}
                          barClassName={theme.bar}
                        />
                      </div>
                    );
                  }),
                  metric.key
                );
              })}

              {aspectRows.length > 0 && (
                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{content.aspectsTitle}</p>
                </div>
              )}

              {aspectRows.map((aspect) => {
                const values = universities.map(
                  (university) => university.aspect_averages?.[aspect.key]
                );
                const winnerIndex = numericWinner(values);

                return renderRow(
                  <>
                    <span className="mr-1" aria-hidden="true">
                      {aspect.icon}
                    </span>
                    {aspect.label}
                  </>,
                  universities.map((university, index) => {
                    const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
                    const isLeader = leaderId != null && String(leaderId) === String(university.id);
                    return (
                      <div key={university.id} className={isLeader ? theme.column : ""}>
                        <MatrixCell
                          value={university.aspect_averages?.[aspect.key]}
                          isWinner={winnerIndex === index}
                          isAspect
                        />
                      </div>
                    );
                  }),
                  aspect.key
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked cards per metric */}
      <div className="space-y-3 sm:hidden">
        {metricRows.map((metric) => {
          const values = universities.map((university) => university[metric.key]);
          const winnerIndex = numericWinner(values);
          const barPercents = relativeBarPercents(values);

          return (
            <div
              key={metric.key}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10"
            >
              <p className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
                {metric.label}
              </p>
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {universities.map((university, index) => {
                  const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
                  return (
                    <div key={university.id} className="flex items-center gap-3 px-3 py-2.5">
                      <UniversityAvatar university={university} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {university.short_name}
                        </p>
                        <MatrixCell
                          value={university[metric.key]}
                          metricKey={metric.key}
                          format={metric.format}
                          isWinner={winnerIndex === index}
                          isAspect={false}
                          barPercent={barPercents[index]}
                          barClassName={theme.bar}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
