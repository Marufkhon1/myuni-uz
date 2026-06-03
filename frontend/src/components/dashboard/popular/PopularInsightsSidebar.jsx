import UserAvatar from "../UserAvatar.jsx";
import UniversityAvatar from "../../UniversityAvatar.jsx";
import { resolveMediaUrl } from "../../../utils/media.js";

const STAT_ICONS = {
  reviews: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  likes: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  rating: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  universities: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  ),
};

function StatTile({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-slate-800/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-black tabular-nums leading-none text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          {icon}
        </span>
      </div>
    </div>
  );
}

function InsightChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      {children}
    </span>
  );
}

function UniversityContextHero({ context, onOpenUniversity }) {
  const displayRating = context?.averageRating;
  if (!context || displayRating == null || Number.isNaN(displayRating)) {
    return null;
  }

  const universityName = context.university.short_name || context.university.name;
  const fullStars = Math.max(0, Math.min(5, Math.round(displayRating)));
  const decimalDisplay = Number.isInteger(displayRating) ? displayRating : displayRating.toFixed(1);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white to-violet-50/30 p-3.5 dark:border-primary/25 dark:from-primary/10 dark:via-slate-900/50 dark:to-violet-400/5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wide text-primary dark:text-blue-300">
            {context.sortLabel}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <UniversityAvatar university={context.university} size="xs" />
            {onOpenUniversity && context.university.id ? (
              <button
                type="button"
                onClick={() => onOpenUniversity(context.university.id)}
                className="truncate text-left text-sm font-black text-slate-950 underline-offset-2 transition hover:text-primary hover:underline dark:text-white dark:hover:text-blue-200"
              >
                {universityName}
              </button>
            ) : (
              <p className="truncate text-sm font-black text-slate-950 dark:text-white">{universityName}</p>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">OTM o&apos;rtacha bahosi</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-baseline justify-end gap-0.5">
            <span className="text-3xl font-black tabular-nums text-slate-950 dark:text-white">{decimalDisplay}</span>
            <span className="text-sm font-bold text-slate-400">/5</span>
          </p>
          <p className="mt-0.5 text-amber-500 text-sm" aria-hidden="true">
            {"★".repeat(fullStars)}
            <span className="text-amber-200/90 dark:text-amber-600/35">{"★".repeat(5 - fullStars)}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-primary/10 pt-3 dark:border-white/10">
        <InsightChip>
          <span className="font-black text-slate-800 dark:text-white">{context.reviewCount}</span> ta sharh
          {context.usesPlatformStats ? " · platformada" : ""}
        </InsightChip>
        {context.fiveStarPercent != null && (
          <InsightChip>{context.fiveStarPercent}% — 5 yulduz</InsightChip>
        )}
        {context.feedReviewCount > 0 && context.feedReviewCount < context.reviewCount && (
          <InsightChip>{context.feedReviewCount} tasi mashhur lentada</InsightChip>
        )}
      </div>
    </div>
  );
}

function MiniStarBars({ distribution, subtitle }) {
  const active = distribution.filter((row) => row.count > 0);
  if (active.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-slate-800/35">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Baho taqsimoti
      </p>
      {subtitle && <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <ul className="mt-2.5 space-y-1.5">
        {distribution.map((row) => (
          <li key={row.stars} className="flex items-center gap-2 text-[10px]">
            <span className="w-3 font-bold tabular-nums text-slate-500 dark:text-slate-400">{row.stars}</span>
            <span className="text-amber-400" aria-hidden="true">
              ★
            </span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <span className="w-7 text-right font-bold tabular-nums text-slate-600 dark:text-slate-300">
              {row.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeaderSpotlight({ review, leaderLabel, onOpenUniversity }) {
  const likes = review.like_count ?? review.helpful_count ?? 0;
  const universityName = review.university?.short_name || review.university?.name;
  const excerpt = (review.text || "").trim().slice(0, 72);
  const excerptSuffix = review.text && review.text.length > 72 ? "…" : "";

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <path d="M5 16L3 5l5.5 2L12 4l3.5 3L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.4 1-2.7-2.3L12 8.5 9.6 6.3 7.2 8.6 4.8 8.6l.9 5.4zM12 18a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {leaderLabel}
        </span>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
          {likes} foydali · ★ {review.rating}
        </span>
      </div>

      <div className="mt-3 flex gap-3">
        <UserAvatar
          name={review.author}
          avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-950 dark:text-white">{review.author}</p>
          {universityName && (
            <div className="mt-1 flex items-center gap-1.5">
              <UniversityAvatar university={review.university} size="xs" />
              {onOpenUniversity && review.university?.id ? (
                <button
                  type="button"
                  onClick={() => onOpenUniversity(review.university.id)}
                  className="truncate text-left text-[11px] font-semibold text-primary underline-offset-2 transition hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 rounded-sm dark:text-blue-300 dark:hover:text-blue-200"
                >
                  {universityName}
                </button>
              ) : (
                <p className="truncate text-[11px] font-semibold text-primary dark:text-blue-300">{universityName}</p>
              )}
            </div>
          )}
          {excerpt && (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              &ldquo;{excerpt}
              {excerptSuffix}&rdquo;
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/40 p-3.5 dark:border-amber-400/25 dark:from-amber-400/12 dark:to-amber-400/5">
      {body}
    </div>
  );
}

export default function PopularInsightsSidebar({
  isStudent,
  stats,
  leaderContext,
  onOpenSection,
  onOpenUniversity,
}) {
  const hasData = stats.count > 0;
  const leaderReview = leaderContext?.leaderReview ?? null;
  const leaderLabel = leaderContext?.sortLabel ?? "Yetakchi sharh";

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-white/12 dark:bg-slate-800/40">
      <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-cyan-400" aria-hidden="true" />

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <header>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Mashhur sharhlar</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Qisqa xulosa</h2>
        </header>

        {!hasData ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center dark:border-white/15 dark:bg-white/[0.03]">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Hali ma&apos;lumot yo&apos;q</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Birinchi mashhur sharhlar paydo bo&apos;lgach, bu yerda statistika chiqadi.
            </p>
          </div>
        ) : (
          <>
            {leaderContext ? (
              <UniversityContextHero context={leaderContext} onOpenUniversity={onOpenUniversity} />
            ) : null}

            {leaderContext?.distribution && (
              <MiniStarBars
                distribution={leaderContext.distribution}
                subtitle={`${leaderContext.university.short_name || leaderContext.university.name} — mashhur lentada`}
              />
            )}

            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Umumiy lenta
            </p>

            <div className="grid grid-cols-2 gap-2">
              <StatTile icon={STAT_ICONS.reviews} label="Sharhlar" value={stats.count} />
              <StatTile icon={STAT_ICONS.likes} label="Foydali" value={stats.totalLikes} />
              <StatTile
                icon={STAT_ICONS.universities}
                label="OTM"
                value={stats.universityCount}
              />
              {stats.verifiedCount > 0 ? (
                <StatTile
                  icon={STAT_ICONS.rating}
                  label="Tasdiqlangan"
                  value={stats.verifiedCount}
                />
              ) : (
                <StatTile
                  icon={STAT_ICONS.rating}
                  label="5★ ulushi"
                  value={stats.fiveStarPercent != null ? `${stats.fiveStarPercent}%` : "—"}
                />
              )}
            </div>

            {leaderReview && (
              <LeaderSpotlight
                review={leaderReview}
                leaderLabel={leaderLabel}
                onOpenUniversity={onOpenUniversity}
              />
            )}
          </>
        )}

        {onOpenSection && (
          <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={() => onOpenSection("reviews")}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white shadow-md shadow-primary/25 transition hover:bg-blue-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-[0.99] dark:focus-visible:ring-offset-slate-900"
            >
              {isStudent ? "Sharh yozish" : "Barcha sharhlarni ko'rish"}
            </button>
            <button
              type="button"
              onClick={() => onOpenSection("compare")}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-blue-200"
            >
              OTMlarni taqqoslash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
