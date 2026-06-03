import { useMemo } from "react";
import UniversityAvatar from "../../UniversityAvatar.jsx";
import CompareStarBadge from "./CompareStarBadge.jsx";
import CompareMetricBar from "./CompareMetricBar.jsx";
import CompareRecommendBadge from "./CompareRecommendBadge.jsx";
import { COMPARE_SLOT_THEMES } from "./compareTheme.js";
import {
  COMPARE_ASPECTS,
  COMPARE_METRIC_GROUPS,
  COMPARE_METRICS,
} from "../../../utils/compareRoleContent.js";
import {
  hasCompareValue,
  metricMaxValue,
  numericWinner,
  relativeBarPercents,
  shouldShowCompareMetric,
} from "../../../utils/compareMath.js";

const METRIC_BY_KEY = Object.fromEntries(COMPARE_METRICS.map((metric) => [metric.key, metric]));

function EmptyValue() {
  return (
    <span className="inline-flex rounded-md bg-slate-100/90 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
      —
    </span>
  );
}

function MatrixCell({
  value,
  metricKey,
  format,
  isWinner,
  isAspect,
  isText,
  barPercent,
  barClassName,
  theme,
  showBar,
  allowZero = false,
}) {
  const formatted = format(value);
  const isEmpty =
    !allowZero &&
    !hasCompareValue(value, allowZero) &&
    (isText ? formatted === "—" : Number(value ?? 0) === 0 && value == null);

  if (isText) {
    return (
      <div className="flex min-h-[3.25rem] items-center justify-center px-2 py-2">
        {isEmpty ? (
          <EmptyValue />
        ) : (
          <span className="rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
            {formatted}
          </span>
        )}
      </div>
    );
  }

  const winnerClass = isWinner
    ? `rounded-xl ${theme.bg} px-2 py-2 ring-1 ring-inset ${theme.headerRing}`
    : "px-2 py-2";

  if (isAspect || metricKey === "average_rating") {
    return (
      <div className={`flex min-h-[3.25rem] flex-col items-center justify-center ${winnerClass}`}>
        {isEmpty ? (
          <EmptyValue />
        ) : (
          <>
            <CompareStarBadge rating={value} size="sm" />
            {isWinner && (
              <span className={`mt-1 text-[10px] font-bold ${theme.label}`}>Yetakchi</span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex min-h-[3.25rem] flex-col items-center justify-center text-center ${winnerClass}`}>
      {isEmpty ? (
        <EmptyValue />
      ) : (
        <>
          <span className="text-sm font-black tabular-nums tracking-tight text-slate-900 dark:text-white sm:text-[15px]">
            {formatted}
          </span>
          <CompareMetricBar
            percent={barPercent}
            barClassName={barClassName}
            show={showBar && barPercent > 0}
          />
          {isWinner && !showBar && (
            <span className={`mt-1 text-[10px] font-bold ${theme.label}`}>Yetakchi</span>
          )}
        </>
      )}
    </div>
  );
}

function GroupHeader({ label, columnTemplate }) {
  return (
    <div
      className="grid border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white dark:border-white/10 dark:from-white/[0.04] dark:to-transparent"
      style={{ gridTemplateColumns: columnTemplate }}
    >
      <p className="sticky left-0 z-[1] col-span-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary dark:text-blue-300">
        {label}
      </p>
    </div>
  );
}

export default function CompareMatrix({ universities, content, showAspects, leaderId }) {
  const columnTemplate = useMemo(
    () => `minmax(9rem, 1.2fr) repeat(${universities.length}, minmax(7rem, 1fr))`,
    [universities.length]
  );

  const visibleGroups = useMemo(
    () =>
      COMPARE_METRIC_GROUPS.map((group) => ({
        ...group,
        metrics: group.keys
          .map((key) => METRIC_BY_KEY[key])
          .filter(Boolean)
          .filter((metric) => shouldShowCompareMetric(universities, metric)),
      })).filter((group) => group.metrics.length > 0),
    [universities]
  );

  const aspectRows = showAspects ? COMPARE_ASPECTS : [];

  function renderRow(label, cells, key, rowIndex) {
    const zebra = rowIndex % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-slate-50/60 dark:bg-white/[0.02]";
    return (
      <div
        key={key}
        className={`group grid items-stretch gap-0 border-b border-slate-100/90 transition hover:bg-primary/[0.03] dark:border-white/[0.06] dark:hover:bg-white/[0.03] ${zebra}`}
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div className="sticky left-0 z-[1] flex items-center gap-2 border-r border-slate-100 bg-inherit px-3 py-3 shadow-[inset_-8px_0_12px_-12px_rgba(15,23,42,0.08)] dark:border-white/10 dark:shadow-[inset_-8px_0_12px_-12px_rgba(0,0,0,0.45)]">
          {typeof label === "string" && METRIC_BY_KEY[key]?.icon ? (
            <span className="text-sm leading-none opacity-80" aria-hidden="true">
              {METRIC_BY_KEY[key].icon}
            </span>
          ) : null}
          <p className="text-[11px] font-bold leading-snug text-slate-600 dark:text-slate-300">{label}</p>
        </div>
        {cells}
      </div>
    );
  }

  function renderMetricRow(metric, rowIndex) {
    const values = universities.map((university) => university[metric.key]);
    const isText = Boolean(metric.text);
    const canHighlight = metric.compareWinner !== false && !isText;
    const winnerIndex = canHighlight
      ? numericWinner(values, { higherIsBetter: metric.higherIsBetter !== false })
      : null;
    const barPercents = relativeBarPercents(values);
    const showBar = Boolean(metric.bar) && metricMaxValue(values) > 0;

    return renderRow(
      metric.label,
      universities.map((university, index) => {
        const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
        const isLeader = leaderId != null && String(leaderId) === String(university.id);
        return (
          <div
            key={university.id}
            className={`${isLeader ? theme.column : ""} border-r border-slate-100/70 last:border-r-0 dark:border-white/[0.05]`}
          >
            <MatrixCell
              value={university[metric.key]}
              metricKey={metric.key}
              format={metric.format}
              isWinner={winnerIndex === index}
              isAspect={false}
              isText={isText}
              barPercent={barPercents[index]}
              barClassName={theme.bar}
              theme={theme}
              showBar={showBar}
              allowZero={Boolean(metric.allowZero)}
            />
          </div>
        );
      }),
      metric.key,
      rowIndex
    );
  }

  let rowCounter = 0;

  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80 dark:bg-[#0b1220] dark:shadow-none dark:ring-white/10 sm:block">
        <div className="overflow-x-auto">
          <div className="min-w-[32rem]">
            <div
              className="sticky top-0 z-20 grid gap-0 border-b border-slate-200/90 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0b1220]/95"
              style={{ gridTemplateColumns: columnTemplate }}
            >
              <p className="sticky left-0 z-[2] flex items-end border-r border-slate-100 bg-inherit px-3 pb-4 pt-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:border-white/10">
                {content.metricsTitle}
              </p>
              {universities.map((university, index) => {
                const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
                const isLeader = leaderId != null && String(leaderId) === String(university.id);
                return (
                  <div
                    key={university.id}
                    className={`relative flex flex-col items-center gap-2 border-r border-slate-100/70 px-2 pb-4 pt-3 text-center last:border-r-0 dark:border-white/[0.05] ${
                      isLeader ? theme.column : ""
                    }`}
                  >
                    <span className={`absolute inset-x-3 top-0 h-1 rounded-full ${theme.bar}`} aria-hidden="true" />
                    <div className={`rounded-2xl p-0.5 ring-2 ${theme.ring}`}>
                      <UniversityAvatar university={university} size="sm" />
                    </div>
                    <div>
                      <p className="line-clamp-2 text-xs font-black leading-tight text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </p>
                      {university.city ? (
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{university.city}</p>
                      ) : null}
                    </div>
                    {isLeader ? <CompareRecommendBadge variant="matrix" className={theme.badge} /> : null}
                  </div>
                );
              })}
            </div>

            <div>
              {visibleGroups.map((group) => (
                <div key={group.id}>
                  <GroupHeader label={group.label} columnTemplate={columnTemplate} />
                  {group.metrics.map((metric) => renderMetricRow(metric, rowCounter++))}
                </div>
              ))}

              {aspectRows.length > 0 && (
                <>
                  <GroupHeader label={content.aspectsTitle} columnTemplate={columnTemplate} />
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
                          <div
                            key={university.id}
                            className={`${isLeader ? theme.column : ""} border-r border-slate-100/70 last:border-r-0 dark:border-white/[0.05]`}
                          >
                            <MatrixCell
                              value={university.aspect_averages?.[aspect.key]}
                              format={(value) => value}
                              isWinner={winnerIndex === index}
                              isAspect
                              barClassName={theme.bar}
                              theme={theme}
                              showBar={false}
                            />
                          </div>
                        );
                      }),
                      aspect.key,
                      rowCounter++
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:hidden">
        {visibleGroups.map((group) => (
          <div key={group.id} className="space-y-2">
            <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">{group.label}</p>
            {group.metrics.map((metric) => {
              const values = universities.map((university) => university[metric.key]);
              const isText = Boolean(metric.text);
              const canHighlight = metric.compareWinner !== false && !isText;
              const winnerIndex = canHighlight
                ? numericWinner(values, { higherIsBetter: metric.higherIsBetter !== false })
                : null;
              const barPercents = relativeBarPercents(values);
              const showBar = Boolean(metric.bar) && metricMaxValue(values) > 0;

              return (
                <div
                  key={metric.key}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10"
                >
                  <p className="border-b border-slate-100 bg-slate-50/80 px-3 py-2.5 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
                    <span className="mr-1.5">{metric.icon}</span>
                    {metric.label}
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-white/10">
                    {universities.map((university, index) => {
                      const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
                      return (
                        <div key={university.id} className="flex items-center gap-3 px-3 py-3">
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
                              isText={isText}
                              barPercent={barPercents[index]}
                              barClassName={theme.bar}
                              theme={theme}
                              showBar={showBar}
                              allowZero={Boolean(metric.allowZero)}
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
        ))}
      </div>
    </>
  );
}
