import { getFilledReviewAspects } from "../../utils/reviewAspects.js";

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

const INLINE_ASPECT_STYLES = {
  teachers: "bg-blue-500/10 ring-blue-200/50 dark:bg-blue-400/10 dark:ring-blue-400/20",
  dormitory: "bg-emerald-500/10 ring-emerald-200/50 dark:bg-emerald-400/10 dark:ring-emerald-400/20",
  infrastructure: "bg-violet-500/10 ring-violet-200/50 dark:bg-violet-400/10 dark:ring-violet-400/20",
};

const CHIP_ASPECT_STYLES = {
  teachers: {
    shell: "border-blue-200/70 bg-gradient-to-br from-blue-50/80 to-white dark:border-blue-400/15 dark:from-blue-500/[0.08] dark:to-white/[0.02]",
    icon: "bg-blue-500/10 text-blue-600 ring-blue-200/60 dark:bg-blue-400/12 dark:text-blue-300 dark:ring-blue-400/25",
    bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    score: "text-blue-600 dark:text-blue-300",
  },
  dormitory: {
    shell: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-white dark:border-emerald-400/15 dark:from-emerald-500/[0.08] dark:to-white/[0.02]",
    icon: "bg-emerald-500/10 text-emerald-600 ring-emerald-200/60 dark:bg-emerald-400/12 dark:text-emerald-300 dark:ring-emerald-400/25",
    bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    score: "text-emerald-600 dark:text-emerald-300",
  },
  infrastructure: {
    shell: "border-violet-200/70 bg-gradient-to-br from-violet-50/80 to-white dark:border-violet-400/15 dark:from-violet-500/[0.08] dark:to-white/[0.02]",
    icon: "bg-violet-500/10 text-violet-600 ring-violet-200/60 dark:bg-violet-400/12 dark:text-violet-300 dark:ring-violet-400/25",
    bar: "bg-gradient-to-r from-violet-500 to-violet-400",
    score: "text-violet-600 dark:text-violet-300",
  },
};

function AspectBar({ label, value, icon, variant = "default", aspectKey }) {
  if (value == null) {
    return null;
  }

  const percent = Math.round((value / 5) * 100);
  const scoreLabel = Number.isInteger(value) ? `${value}/5` : `${value.toFixed(1)}/5`;

  if (variant === "inline") {
    const inlineShell = INLINE_ASPECT_STYLES[aspectKey] ?? INLINE_ASPECT_STYLES.teachers;

    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 ring-1 ${inlineShell}`}
        title={`${label}: ${scoreLabel}`}
      >
        <span
          className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/70 text-sm leading-none dark:bg-white/10"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className={`shrink-0 text-xs font-black tabular-nums leading-none ${ASPECT_CHIP_THEME.score}`}>
          {scoreLabel}
        </span>
      </span>
    );
  }

  if (variant === "chip") {
    const chipTheme = CHIP_ASPECT_STYLES[aspectKey] ?? CHIP_ASPECT_STYLES.teachers;

    return (
      <div
        className={`flex w-full min-w-0 flex-col gap-2.5 rounded-2xl border px-3.5 py-3 shadow-sm ${chipTheme.shell}`}
        title={`${label}: ${scoreLabel}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ring-1 ${chipTheme.icon}`}
              aria-hidden="true"
            >
              {icon}
            </span>
            <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
          </div>
          <p className={`shrink-0 text-sm font-black tabular-nums ${chipTheme.score ?? ASPECT_CHIP_THEME.score}`}>
            {scoreLabel}
          </p>
        </div>
        <div className={`h-2 w-full overflow-hidden rounded-full ${ASPECT_CHIP_THEME.track}`}>
          <div className={`h-full rounded-full transition-all duration-500 ${chipTheme.bar}`} style={{ width: `${percent}%` }} />
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

  const filledAspects = getFilledReviewAspects(source);
  if (filledAspects.length === 0) {
    return null;
  }

  const chipGridClass =
    filledAspects.length === 1
      ? "grid-cols-1"
      : filledAspects.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-3";

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {filledAspects.map((aspect) => (
          <AspectBar
            key={aspect.id}
            label={aspect.label}
            icon={aspect.icon}
            aspectKey={aspect.key}
            value={source[aspect.id] ?? source[aspect.key]}
            variant="inline"
          />
        ))}
      </div>
    );
  }

  if (variant === "chip") {
    return (
      <div className={`grid w-full min-w-0 gap-2.5 ${chipGridClass}`}>
        {filledAspects.map((aspect) => (
          <AspectBar
            key={aspect.id}
            label={aspect.label}
            icon={aspect.icon}
            aspectKey={aspect.key}
            value={source[aspect.id] ?? source[aspect.key]}
            variant="chip"
          />
        ))}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-2">
        {filledAspects.map((aspect) => (
          <AspectBar
            key={aspect.id}
            label={aspect.label}
            icon={aspect.icon}
            aspectKey={aspect.key}
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
      {filledAspects.map((aspect) => (
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
