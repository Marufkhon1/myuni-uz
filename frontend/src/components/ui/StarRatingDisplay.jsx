import { formatStarRatingLabel } from "@/utils/starRatingA11y.js";

export function FractionalStars({
  rating,
  max = 5,
  starClassName = "",
  emptyStarClassName = "text-amber-200 dark:text-amber-500/25",
  filledStarClassName = "text-amber-400",
}) {
  const clamped = Math.min(max, Math.max(0, Number(rating) || 0));

  return (
    <span className="inline-flex items-center leading-none" aria-hidden="true">
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, clamped - index));

        if (fill >= 1) {
          return (
            <span key={index} className={`${filledStarClassName} ${starClassName}`}>
              ★
            </span>
          );
        }

        if (fill <= 0) {
          return (
            <span key={index} className={`${emptyStarClassName} ${starClassName}`}>
              ★
            </span>
          );
        }

        return (
          <span key={index} className={`relative inline-block w-[1em] text-center leading-none ${starClassName}`}>
            <span className={emptyStarClassName}>★</span>
            <span
              className={`absolute inset-y-0 left-0 overflow-hidden text-center ${filledStarClassName}`}
              style={{ width: `${fill * 100}%` }}
            >
              <span className="inline-block w-[1em]">★</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function StarRatingDisplay({
  rating,
  max = 5,
  className = "",
  starClassName = "",
  filledStarClassName,
  emptyStarClassName,
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
  const label = formatStarRatingLabel(numeric, { max, emptyLabel });
  const formatted = numeric % 1 === 0 ? String(numeric) : numeric.toFixed(1);
  const starsProps = {
    rating: numeric,
    max,
    starClassName,
    ...(filledStarClassName ? { filledStarClassName } : {}),
    ...(emptyStarClassName ? { emptyStarClassName } : {}),
  };

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 ring-1 ring-amber-200/70 dark:bg-amber-400/10 dark:ring-amber-400/20 ${className}`}
        role="img"
        aria-label={label}
      >
        <FractionalStars {...starsProps} />
        {showNumeric && (
          <span className={numericClassName} aria-hidden="true">
            {formatted}/{max}
          </span>
        )}
      </span>
    );
  }

  if (variant === "card") {
    return (
      <span
        className={`inline-flex flex-col items-center gap-0.5 rounded-xl bg-white px-2.5 py-1 ring-1 ring-slate-200/80 ${className}`}
        role="img"
        aria-label={label}
      >
        <FractionalStars {...starsProps} />
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
      <FractionalStars {...starsProps} />
      {showNumeric && (
        <span className={numericClassName} aria-hidden="true">
          {formatted}/{max}
        </span>
      )}
    </span>
  );
}
