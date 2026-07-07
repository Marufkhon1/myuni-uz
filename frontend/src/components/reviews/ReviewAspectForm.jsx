import { REVIEW_ASPECTS } from "@/utils/reviewAspects.js";
import { getRatingHint } from "@/utils/starRatingHints.js";
import StarRatingRow from "./StarRatingRow.jsx";

const ASPECT_STYLES = {
  teachers: {
    iconWrap: "bg-blue-500/10 text-blue-600 ring-blue-200/60 dark:bg-blue-400/12 dark:text-blue-300 dark:ring-blue-400/25",
    card: "border-blue-200/50 dark:border-blue-400/15",
    glow: "from-blue-400/10 to-transparent",
  },
  dormitory: {
    iconWrap: "bg-emerald-500/10 text-emerald-600 ring-emerald-200/60 dark:bg-emerald-400/12 dark:text-emerald-300 dark:ring-emerald-400/25",
    card: "border-emerald-200/50 dark:border-emerald-400/15",
    glow: "from-emerald-400/10 to-transparent",
  },
  infrastructure: {
    iconWrap: "bg-violet-500/10 text-violet-600 ring-violet-200/60 dark:bg-violet-400/12 dark:text-violet-300 dark:ring-violet-400/25",
    card: "border-violet-200/50 dark:border-violet-400/15",
    glow: "from-violet-400/10 to-transparent",
  },
};

export function AspectRatingRows({ aspectRatings, onAspectChange }) {
  return (
    <div className="space-y-3">
      {REVIEW_ASPECTS.map((aspect) => {
        const value = aspectRatings[aspect.id];
        const styles = ASPECT_STYLES[aspect.key] ?? ASPECT_STYLES.teachers;
        const isRated = value > 0;

        return (
          <div
            key={aspect.id}
            className={`relative overflow-hidden rounded-2xl border bg-white/80 p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-white/[0.03] ${styles.card} ${
              isRated ? "ring-1 ring-emerald-300/30 dark:ring-emerald-400/20" : ""
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l ${styles.glow}`}
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ring-1 ${styles.iconWrap}`}
                  aria-hidden="true"
                >
                  {aspect.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{aspect.label}</p>
                  <p
                    className={`mt-0.5 text-xs font-semibold ${
                      isRated ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                    }`}
                  >
                    {isRated ? getRatingHint(value) : "Baholang"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-end sm:w-[15.5rem]">
                <StarRatingRow
                  value={value}
                  onChange={(next) => onAspectChange(aspect.id, next)}
                  size="sm"
                  variant="default"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewAspectForm({
  rating,
  onRatingChange,
  aspectRatings,
  onAspectChange,
  step = "all",
}) {
  if (step === "overall") {
    return (
      <StarRatingRow
        value={rating}
        onChange={onRatingChange}
        size="lg"
        label="Umumiy tajribangiz qanday?"
        showHint
        centered
        variant="default"
      />
    );
  }

  if (step === "aspects") {
    return <AspectRatingRows aspectRatings={aspectRatings} onAspectChange={onAspectChange} />;
  }

  return null;
}
