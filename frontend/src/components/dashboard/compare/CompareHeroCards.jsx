import UniversityAvatar from "../../UniversityAvatar.jsx";
import { COMPARE_SLOT_THEMES } from "./compareTheme.js";
import CompareRecommendBadge from "./CompareRecommendBadge.jsx";
import { formatCompareRating } from "../../../utils/compareMath.js";
import { CAMPUS_IMAGE_PATHS, campusIndex, getUniversityImageUrl } from "../../../utils/universityImage.js";
import { FractionalStars } from "../../ui/StarRatingDisplay.jsx";

function heroImageForCard(university, index) {
  const primary = getUniversityImageUrl(university);
  const fallbackIndex = (campusIndex(university) + index) % CAMPUS_IMAGE_PATHS.length;
  const fallback = CAMPUS_IMAGE_PATHS[fallbackIndex];
  if (primary === fallback) {
    return fallback;
  }
  return primary || fallback;
}

function PositionBadge({ isLeader, positionBadge, theme }) {
  if (isLeader) {
    return <CompareRecommendBadge className={theme.badge} />;
  }

  if (positionBadge != null) {
    return (
      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/80 ring-1 ring-white/20">
        #{positionBadge}
      </span>
    );
  }

  return (
    <span className="invisible rounded-full px-2 py-0.5 text-[10px] font-bold" aria-hidden="true">
      #
    </span>
  );
}

function RatingDisplay({ rating }) {
  const hasRating = rating != null && !Number.isNaN(Number(rating));
  const label = hasRating ? formatCompareRating(rating) : null;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">Reyting</p>
        {hasRating ? (
          <p className="mt-0.5 flex items-baseline gap-1">
            <span className="text-3xl font-black tabular-nums leading-none text-white">{label}</span>
            <span className="text-sm font-bold text-white/45">/5</span>
          </p>
        ) : (
          <p className="mt-0.5 text-sm font-semibold leading-snug text-white/90">Hali baho yo&apos;q</p>
        )}
      </div>
      <div
        className="shrink-0 rounded-xl bg-white px-2.5 py-1.5 shadow-md ring-1 ring-white/30"
        role="img"
        aria-label={hasRating ? `${label} dan 5 yulduz` : "Reyting hali berilmagan"}
      >
        {hasRating ? (
          <div className="flex flex-col items-center">
            <FractionalStars
              rating={Number(rating)}
              starClassName="text-sm"
              filledStarClassName="text-amber-400"
              emptyStarClassName="text-slate-300"
            />
            <p className="mt-0.5 text-center text-[10px] font-black tabular-nums text-amber-950">
              {label}/5
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FractionalStars
              rating={0}
              starClassName="text-sm"
              filledStarClassName="text-amber-400"
              emptyStarClassName="text-slate-300"
            />
            <p className="mt-0.5 text-center text-[10px] font-black tabular-nums text-amber-950">—/5</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value, icon, theme }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/90 px-2.5 py-2 dark:bg-white/[0.04]">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ${theme.statIcon}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-base font-black tabular-nums text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function CompareHeroCards({ universities, leaderId, onViewReviews }) {
  return (
    <div
      className={`grid items-stretch gap-4 ${
        universities.length === 3 ? "lg:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      {universities.map((university, index) => {
        const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
        const isLeader = index === 1 && leaderId != null && String(leaderId) === String(university.id);
        const positionBadge = index === 0 ? 1 : index === 2 ? 3 : null;
        const imageUrl = heroImageForCard(university, index);

        return (
          <article
            key={university.id}
            className={`group flex h-full flex-col overflow-hidden rounded-[1.35rem] bg-white ring-1 ring-slate-200/80 transition hover:ring-slate-300 dark:bg-[#0b1220] dark:ring-white/10 dark:hover:ring-white/20 ${
              isLeader ? `ring-2 ${theme.ring} ${theme.headerGlow}` : ""
            }`}
          >
            {/* Banner — faqat logo va nom */}
            <div className={`relative h-[8.5rem] shrink-0 overflow-hidden ${theme.accent}`}>
              <img
                src={imageUrl}
                alt=""
                role="presentation"
                className="absolute inset-0 h-full w-full scale-105 object-cover transition duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.headerGradient}`} />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />

              <div className="relative flex h-full flex-col justify-between p-4">
                <div className="flex min-h-[1.625rem] items-start">
                  <PositionBadge isLeader={isLeader} positionBadge={positionBadge} theme={theme} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-2xl bg-white/95 p-0.5 shadow-lg ring-2 ring-white/30">
                    <UniversityAvatar university={university} size="md" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black leading-tight text-white drop-shadow-sm">
                      {university.short_name || university.name}
                    </h3>
                    {university.location ? (
                      <p className="mt-0.5 truncate text-xs font-medium text-white/75">{university.location}</p>
                    ) : (
                      <p className="mt-0.5 text-xs font-medium text-transparent" aria-hidden="true">
                        —
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reyting — alohida qator, kesilmaydi */}
            <div
              className={`shrink-0 border-b-2 bg-gradient-to-r px-4 py-3.5 ${theme.accent} ${theme.headerGradient}`}
            >
              <RatingDisplay rating={university.average_rating} />
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 p-3">
              <StatTile
                label="Sharh"
                value={university.review_count ?? 0}
                icon="💬"
                theme={theme}
              />
              <StatTile
                label="Chat"
                value={university.member_count ?? 0}
                icon="👥"
                theme={theme}
              />
            </div>

            {onViewReviews && (
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={() => onViewReviews(university.id)}
                  className={`w-full rounded-xl bg-slate-900 px-3 py-2.5 text-center text-xs font-black text-white transition hover:scale-[1.02] hover:shadow-md dark:bg-white dark:text-slate-900 ${theme.footerHover}`}
                >
                  Sharhlarni ko&apos;rish
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
