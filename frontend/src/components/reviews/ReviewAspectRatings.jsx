import { REVIEW_ASPECTS } from "../../utils/reviewAspects.js";

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

export function formatReviewDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const ASPECT_CHIP_THEME = {
  shell:
    "bg-slate-950/[0.04] ring-slate-950/10 dark:bg-white/[0.08] dark:ring-white/12",
  bar: "bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-blue-300",
  track: "bg-slate-200/90 dark:bg-white/15",
  score: "text-primary dark:text-blue-300",
};

function AspectBar({ label, value, icon, variant = "default" }) {
  if (value == null) {
    return null;
  }

  const percent = Math.round((value / 5) * 100);
  const scoreLabel = Number.isInteger(value) ? `${value}/5` : `${value.toFixed(1)}/5`;

  if (variant === "inline") {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 ring-1 ${ASPECT_CHIP_THEME.shell}`}
        title={`${label}: ${scoreLabel}`}
      >
        <span className="shrink-0 text-sm leading-none" aria-hidden="true">
          {icon}
        </span>
        <span
          className={`shrink-0 text-xs font-black tabular-nums leading-none ${ASPECT_CHIP_THEME.score}`}
        >
          {scoreLabel}
        </span>
      </span>
    );
  }

  if (variant === "chip") {
    return (
      <div
        className={`flex w-full min-w-0 flex-col gap-1 rounded-xl px-2.5 py-1.5 ring-1 ${ASPECT_CHIP_THEME.shell}`}
        title={`${label}: ${scoreLabel}`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-base leading-none" aria-hidden="true">
            {icon}
          </span>
          <span className="min-w-0 truncate text-xs font-bold leading-snug text-slate-600 dark:text-slate-300">
            {label}
          </span>
          <span
            className={`ml-auto shrink-0 text-xs font-black tabular-nums leading-none ${ASPECT_CHIP_THEME.score}`}
          >
            {scoreLabel}
          </span>
        </div>
        <div className={`h-1 w-full overflow-hidden rounded-full ${ASPECT_CHIP_THEME.track}`}>
          <div
            className={`h-full rounded-full ${ASPECT_CHIP_THEME.bar}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl bg-slate-950/[0.03] px-3.5 py-3 ring-1 ring-slate-950/10 dark:bg-white/[0.04] dark:ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold leading-snug text-slate-600 dark:text-slate-300">
          {icon ? (
            <span className="mr-1.5 text-base leading-none" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {label}
        </span>
        <span className="shrink-0 text-xs font-black tabular-nums text-primary dark:text-blue-300">
          {scoreLabel}
        </span>
      </div>
      <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${ASPECT_CHIP_THEME.track}`}>
        <div
          className={`h-full rounded-full ${ASPECT_CHIP_THEME.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function ReviewAspectRatings({
  item,
  averages,
  compact = false,
  variant = compact ? "chip" : "default",
}) {
  const source = averages || item;
  if (!source) {
    return null;
  }

  const hasAspects = REVIEW_ASPECTS.some(
    (aspect) => source[aspect.id] != null || source[aspect.key] != null
  );
  if (!hasAspects) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {REVIEW_ASPECTS.map((aspect) => (
          <AspectBar
            key={aspect.id}
            label={aspect.label}
            icon={aspect.icon}
            value={source[aspect.id] ?? source[aspect.key]}
            variant="inline"
          />
        ))}
      </div>
    );
  }

  if (variant === "chip") {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
        {REVIEW_ASPECTS.map((aspect) => (
          <AspectBar
            key={aspect.id}
            label={aspect.label}
            icon={aspect.icon}
            value={source[aspect.id] ?? source[aspect.key]}
            variant="chip"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-2.5 ${
        compact
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          : "mt-3 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3"
      }`}
    >
      {REVIEW_ASPECTS.map((aspect) => (
        <AspectBar
          key={aspect.id}
          label={aspect.label}
          icon={aspect.icon}
          value={source[aspect.id] ?? source[aspect.key]}
        />
      ))}
    </div>
  );
}
