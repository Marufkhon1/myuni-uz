import UniversityIdentity from "../UniversityIdentity.jsx";
import ReviewAspectRatings from "../reviews/ReviewAspectRatings.jsx";
import { formatStarRatingLabel } from "../../utils/starRatingA11y.js";
import { getUniversityImageUrl } from "../../utils/universityImage.js";
import ReviewRatingDistribution from "./ReviewRatingDistribution.jsx";
import { FractionalStars } from "../ui/StarRatingDisplay.jsx";

function formatDecimalRating(value) {
  if (value == null) {
    return null;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }
  return num.toFixed(1);
}

function MetaPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
      {children}
    </span>
  );
}

function StarDisplay({ rating, size = "sm" }) {
  const starSize = size === "lg" ? "text-lg" : "text-sm";
  return (
    <FractionalStars
      rating={rating}
      starClassName={starSize}
      emptyStarClassName="text-slate-200 dark:text-slate-700"
    />
  );
}

export default function ReviewWorkspaceHero({
  university,
  eyebrow,
  shortName,
  location,
  summary,
  averageRating,
  reviewCount,
  metaHeader,
  memberCount,
  aspectAverages,
  distribution,
  statLabels,
  ratingFilter = "all",
  onRatingFilterChange,
}) {
  const hasReviews = reviewCount > 0;
  const displayRating = formatDecimalRating(averageRating);
  const showDistribution = hasReviews && distribution;
  const hasAspects = aspectAverages?.review_count > 0;
  const coverUrl = getUniversityImageUrl(university);
  const metaParts = [metaHeader, memberCount > 0 ? `${memberCount} chat a'zosi` : null].filter(Boolean);

  return (
    <header className="shrink-0 overflow-hidden bg-white dark:bg-[#0b1220]">
      <div className="relative bg-gradient-to-br from-slate-900 via-[#0f2744] to-primary/90">
        {coverUrl && (
          <>
            <img
              src={coverUrl}
              alt=""
              role="presentation"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/72 to-slate-950/55" aria-hidden="true" />
          </>
        )}

        <div className="relative px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/90">{eyebrow}</p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex min-w-0 items-start gap-4 lg:flex-1">
              <UniversityIdentity university={university} size="lg" />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-black leading-tight text-white sm:text-xl">
                    {university?.name}
                  </h1>
                  {shortName && (
                    <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {shortName}
                    </span>
                  )}
                </div>
                {location && <p className="mt-1 text-sm text-slate-300">{location}</p>}
                {metaParts.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {metaParts.map((part) => (
                      <MetaPill key={part}>{part}</MetaPill>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {summary && (
              <div className="min-w-0 lg:max-w-[22rem] lg:flex-1 lg:border-l lg:border-white/10 lg:pl-6 xl:max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300/80">
                  Universitet haqida
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300/95">{summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.02] sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-5">
          <div className="flex min-w-0 shrink-0 items-center gap-4">
            <div className="flex shrink-0 items-baseline gap-1">
              <span className="text-4xl font-black tabular-nums leading-none tracking-tight text-slate-950 dark:text-white">
                {displayRating ?? "—"}
              </span>
              <span className="text-sm font-semibold text-slate-400">/5</span>
            </div>

            <div className="h-11 w-px shrink-0 bg-slate-200 dark:bg-white/10" aria-hidden="true" />

            <div className="min-w-0 shrink-0" role="img" aria-label={formatStarRatingLabel(averageRating)}>
              <div aria-hidden="true">
                <StarDisplay rating={averageRating} size="lg" />
              </div>
              <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-white">
                {hasReviews ? `${reviewCount} ${statLabels.reviews.toLowerCase()}` : "Hali sharh yo'q"}
              </p>
              {!hasReviews && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Birinchi sharhni siz qoldiring
                </p>
              )}
            </div>
          </div>

          {hasAspects && (
            <>
              <div className="hidden h-12 w-px shrink-0 bg-slate-200 dark:bg-white/10 sm:block" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <ReviewAspectRatings averages={aspectAverages} compact />
              </div>
            </>
          )}

          {showDistribution && (
            <>
              <div className="hidden h-14 w-px shrink-0 bg-slate-200 dark:bg-white/10 xl:block" aria-hidden="true" />
              <div className="min-w-0 xl:w-44 xl:shrink-0">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Baholar taqsimoti
                </p>
                <ReviewRatingDistribution
                  distribution={distribution}
                  reviewCount={reviewCount}
                  activeFilter={ratingFilter}
                  onFilterChange={onRatingFilterChange}
                  compact
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
