import UniversityIdentity from "../UniversityIdentity.jsx";
import ReviewAspectRatings from "../reviews/ReviewAspectRatings.jsx";
import { formatStarRatingLabel } from "../../utils/starRatingA11y.js";
import { getUniversityImageUrl } from "../../utils/universityImage.js";
import { buildHeroSidePanel } from "../../utils/universityPublic.js";
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

function MetaPill({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
      {icon ? (
        <span className="text-[10px] leading-none opacity-80" aria-hidden="true">
          {icon}
        </span>
      ) : null}
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
      filledStarClassName="text-amber-400"
      emptyStarClassName="text-slate-200 dark:text-slate-700"
    />
  );
}

function PanelTitle({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200/90">{children}</p>
  );
}

function HeroPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function HeroFactRow({ label, value, href }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 py-2 last:border-b-0">
      <span className="text-xs font-semibold text-white/55">{label}</span>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="text-right text-xs font-bold text-white transition hover:text-blue-200 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-right text-xs font-bold text-white">{value}</span>
      )}
    </div>
  );
}

function HeroSidePanel({ visibleDirections, hiddenDirectionCount, facultyItems, facts }) {
  return (
    <HeroPanel className="flex flex-col gap-4">
      {visibleDirections.length > 0 && (
        <div>
          <PanelTitle>Mashhur yo&apos;nalishlar</PanelTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleDirections.map((name) => (
              <MetaPill key={name} icon="🎓">
                {name}
              </MetaPill>
            ))}
            {hiddenDirectionCount > 0 && <MetaPill>+{hiddenDirectionCount} ta</MetaPill>}
          </div>
        </div>
      )}

      {facultyItems.length > 0 && (
        <div>
          <PanelTitle>Fakultetlar</PanelTitle>
          <ul className="mt-2 space-y-1.5">
            {facultyItems.map((faculty) => (
              <li
                key={faculty.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-100/95"
              >
                <span className="min-w-0 font-semibold">{faculty.name}</span>
                {faculty.count > 0 && (
                  <span className="shrink-0 text-[11px] font-bold text-white/50">{faculty.count} ta</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {facts.length > 0 && (
        <div className={visibleDirections.length > 0 || facultyItems.length > 0 ? "border-t border-white/10 pt-3" : ""}>
          <PanelTitle>Asosiy ma&apos;lumot</PanelTitle>
          <div className="mt-2">
            {facts.map((fact) => (
              <HeroFactRow key={fact.label} {...fact} />
            ))}
          </div>
        </div>
      )}
    </HeroPanel>
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
  reviews = [],
}) {
  const hasReviews = reviewCount > 0;
  const displayRating = formatDecimalRating(averageRating);
  const showDistribution = hasReviews && distribution;
  const hasAspects = aspectAverages?.review_count > 0;
  const coverUrl = getUniversityImageUrl(university);
  const displayTitle = university?.name;
  const sidePanel = buildHeroSidePanel(university, reviews, { reviewCount, averageRating });

  return (
    <header className="shrink-0 overflow-hidden bg-white dark:bg-[#0b1220]">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0c1a33] to-primary">
        {coverUrl && (
          <>
            <img
              src={coverUrl}
              alt=""
              role="presentation"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35"
              loading="eager"
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-[#0c1a33]/88 to-primary/75"
              aria-hidden="true"
            />
          </>
        )}

        <div
          className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative px-5 py-6 sm:px-6 sm:py-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/90">{eyebrow}</p>

          <div className="mt-4 flex shrink-0 items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-white/25 to-blue-400/20 blur-sm"
                aria-hidden="true"
              />
              <UniversityIdentity
                university={university}
                size="lg"
                className="relative !h-[4.75rem] !w-[4.75rem] !rounded-[1.15rem] sm:!h-20 sm:!w-20 sm:!rounded-[1.25rem]"
              />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
                  {displayTitle}
                </h1>
                {shortName && (
                  <span className="rounded-lg bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white ring-1 ring-white/20 backdrop-blur-sm">
                    {shortName}
                  </span>
                )}
              </div>

              {location && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-300/90">
                  <span className="text-xs opacity-70" aria-hidden="true">
                    📍
                  </span>
                  {location}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {metaHeader && <MetaPill icon="🏛️">{metaHeader}</MetaPill>}
                {memberCount > 0 && <MetaPill icon="💬">{memberCount} chat a&apos;zosi</MetaPill>}
              </div>
            </div>
          </div>

          {summary && sidePanel.hasLeftPanel && (
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
              <HeroSidePanel {...sidePanel} />
              <HeroPanel className="flex flex-col">
                <PanelTitle>Universitet haqida</PanelTitle>
                <p className="mt-2.5 text-sm leading-[1.75] text-slate-100/95">{summary}</p>
              </HeroPanel>
            </div>
          )}

          {summary && !sidePanel.hasLeftPanel && (
            <div className="mt-5 lg:mx-auto lg:max-w-3xl">
              <HeroPanel>
                <PanelTitle>Universitet haqida</PanelTitle>
                <p className="mt-2.5 text-center text-sm leading-[1.75] text-slate-100/95 sm:text-left">
                  {summary}
                </p>
              </HeroPanel>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 px-5 py-4 dark:border-white/10 dark:from-white/[0.03] dark:via-[#0b1220] dark:to-white/[0.02] sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 divide-y divide-slate-200/70 dark:divide-white/10 xl:grid-cols-[minmax(0,13.5rem)_minmax(0,1fr)_minmax(0,11.5rem)] xl:divide-x xl:divide-y-0">
            <div className="flex min-w-0 items-center gap-4 p-4 sm:p-5 xl:shrink-0">
              <div className="shrink-0 text-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-4xl font-black tabular-nums leading-none tracking-tight text-slate-950 dark:text-white">
                    {displayRating ?? "—"}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/5</span>
                </div>
                <div className="mt-2 flex justify-center" role="img" aria-label={formatStarRatingLabel(averageRating)}>
                  <StarDisplay rating={averageRating} size="lg" />
                </div>
              </div>
              <div className="min-w-0 border-l border-slate-200/70 pl-4 dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Umumiy reyting</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                  {hasReviews ? `${reviewCount} ${statLabels.reviews.toLowerCase()}` : "Hali sharh yo'q"}
                </p>
                {!hasReviews && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Birinchi sharhni siz qoldiring</p>
                )}
              </div>
            </div>

            {hasAspects && (
              <div className="min-w-0 overflow-hidden p-4 sm:p-5">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Mezonlar bo&apos;yicha
                </p>
                <ReviewAspectRatings averages={aspectAverages} variant="hero" />
              </div>
            )}

            {showDistribution && (
              <div className="min-w-0 overflow-hidden p-4 sm:p-5 xl:shrink-0">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
