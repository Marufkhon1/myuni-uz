import { formatStarRatingLabel } from "../../utils/starRatingA11y.js";

export default function StarRatingDisplay({
  rating,
  max = 5,
  className = "",
  starClassName = "",
  showNumeric = true,
  numericClassName = "ml-2 text-xs font-black text-slate-500 dark:text-slate-400",
  emptyLabel = "Baho berilmagan",
  variant = "inline",
}) {
  if (rating == null || Number.isNaN(Number(rating))) {
    return (
      <span className={className} role="img" aria-label={emptyLabel}>
        {emptyLabel}
      </span>
    );
  }

  const numeric = Number(rating);
  const filled = Math.min(max, Math.max(0, Math.round(numeric)));
  const label = formatStarRatingLabel(numeric, { max, emptyLabel });
  const formatted = numeric % 1 === 0 ? String(numeric) : numeric.toFixed(1);

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 ring-1 ring-amber-200/70 dark:bg-amber-400/10 dark:ring-amber-400/20 ${className}`}
        role="img"
        aria-label={label}
      >
        <span className={`leading-none text-amber-400 ${starClassName}`} aria-hidden="true">
          {"★".repeat(filled)}
          {"☆".repeat(max - filled)}
        </span>
        {showNumeric && (
          <span className={numericClassName} aria-hidden="true">
            {formatted}/{max}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className}`} role="img" aria-label={label}>
      <span className={`text-amber-400 ${starClassName}`} aria-hidden="true">
        {"★".repeat(filled)}
      </span>
      {showNumeric && (
        <span className={numericClassName} aria-hidden="true">
          {formatted}/{max}
        </span>
      )}
    </span>
  );
}
