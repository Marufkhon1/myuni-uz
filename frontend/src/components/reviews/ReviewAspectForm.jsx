import { REVIEW_ASPECTS } from "../../utils/reviewAspects.js";
import StarRatingRow, { getRatingHint } from "./StarRatingRow.jsx";

export function AspectRatingRows({ aspectRatings, onAspectChange }) {
  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-xl ring-1 ring-slate-200/80 dark:divide-white/10 dark:ring-white/10">
      {REVIEW_ASPECTS.map((aspect) => {
        const value = aspectRatings[aspect.id];

        return (
          <div
            key={aspect.id}
            className="flex flex-col gap-3 bg-white px-4 py-3.5 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3"
          >
            <div className="flex min-w-0 items-center gap-2.5 sm:flex-1">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-base dark:bg-white/[0.06]"
                aria-hidden="true"
              >
                {aspect.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{aspect.label}</p>
                <p className="text-[11px] text-slate-400">
                  {value > 0 ? getRatingHint(value) : "Baholang"}
                </p>
              </div>
            </div>
            <StarRatingRow
              value={value}
              onChange={(next) => onAspectChange(aspect.id, next)}
              size="md"
              variant="minimal"
            />
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
  studyDirectionId,
  onStudyDirectionChange,
  directions = [],
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
        variant="minimal"
      />
    );
  }

  if (step === "aspects") {
    return <AspectRatingRows aspectRatings={aspectRatings} onAspectChange={onAspectChange} />;
  }

  if (step === "details") {
    if (directions.length === 0) {
      return null;
    }

    return (
      <div>
        <label htmlFor="review-direction" className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Yo&apos;nalish <span className="font-normal text-slate-400">(ixtiyoriy)</span>
        </label>
        <select
          id="review-direction"
          value={studyDirectionId}
          onChange={(event) => onStudyDirectionChange(event.target.value)}
          className="mt-1.5 h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm font-semibold ring-1 ring-slate-200/80 outline-none transition focus:ring-2 focus:ring-primary/40 dark:bg-white/[0.04] dark:ring-white/10"
        >
          <option value="">Tanlanmagan</option>
          {directions.map((direction) => (
            <option key={direction.id} value={direction.id}>
              {direction.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}
