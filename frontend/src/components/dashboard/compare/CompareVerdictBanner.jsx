import UniversityAvatar from "../../UniversityAvatar.jsx";
import { FractionalStars } from "../../ui/StarRatingDisplay.jsx";
import CompareRecommendBadge from "./CompareRecommendBadge.jsx";
import { COMPARE_SLOT_THEMES } from "./compareTheme.js";
import { formatCompareRating, winSharePercent } from "../../../utils/compareMath.js";

function leaderSubtitle(leader, summary, content) {
  if (!leader?.university) {
    return null;
  }

  const { wins, compositeScore } = leader;
  const { decidedRows, tieRows, leaderSource } = summary;

  if (leaderSource === "composite" || leaderSource === "composite_tiebreak") {
    if (leaderSource === "composite_tiebreak") {
      return (
        <>
          Ko&apos;rsatkichlar teng ({tieRows} durang) — umumiy ball{" "}
          <span className="font-black text-white">{compositeScore}/100</span>
        </>
      );
    }
    return (
      <>
        Umumiy ball bo&apos;yicha yetakchi:{" "}
        <span className="font-black text-white">{compositeScore}/100</span>
        {wins > 0 && (
          <span className="text-blue-200/90">
            {" "}
            · {wins}/{decidedRows} qator g&apos;olibi
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <span className="font-black text-white">
        {wins}/{decidedRows}
      </span>{" "}
      {content.winRowsLabel}
      {tieRows > 0 && <span className="text-blue-200/90"> · {tieRows} ta durang</span>}
    </>
  );
}

function WinStatCard({ university, index, wins, decidedRows, composite, isLeader }) {
  const pct = winSharePercent(wins, decidedRows);
  const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
  const rating = university.average_rating;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/[0.06] backdrop-blur-sm transition ${
        isLeader
          ? "border-amber-400/40 shadow-[0_12px_40px_-16px_rgba(251,191,36,0.45)] ring-1 ring-amber-400/35"
          : "border-white/10"
      }`}
    >
      <div className={`h-1 w-full ${theme.bar}`} aria-hidden="true" />
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{university.short_name || university.name}</p>
            {rating != null && (
              <div className="mt-1 flex items-center gap-1.5">
                <FractionalStars
                  rating={Number(rating)}
                  starClassName="text-[10px]"
                  filledStarClassName="text-amber-400"
                  emptyStarClassName="text-white/20"
                />
                <span className="text-[10px] font-bold tabular-nums text-blue-100/90">
                  {formatCompareRating(rating)}/5
                </span>
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-black tabular-nums leading-none text-white">
              {wins}/{decidedRows}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">g&apos;alaba</p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${index === 0 ? "from-blue-400 to-primary" : index === 1 ? "from-violet-400 to-violet-500" : "from-emerald-400 to-emerald-500"} transition-all duration-700`}
            style={{ width: `${Math.max(pct, wins > 0 ? 8 : 0)}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold">
          <span className="text-blue-100/80">{pct}% ustunlik</span>
          {composite != null && (
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-black tabular-nums text-white">
              {composite.score} ball
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompareVerdictBanner({ summary, content }) {
  const { universities, winCounts, decidedRows, tieRows, leader, compositeScores } = summary;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#0c1a33] to-primary text-white ring-1 ring-white/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300/90">{content.verdictTitle}</p>
          {decidedRows > 0 && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 ring-1 ring-white/10">
              {decidedRows} ta qator · {tieRows > 0 ? `${tieRows} durang` : "durang yo'q"}
            </span>
          )}
        </div>

        {leader?.university ? (
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-[1.25rem] bg-amber-400/25 blur-md" aria-hidden="true" />
                <UniversityAvatar university={leader.university} size="lg" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black tracking-tight sm:text-3xl">
                  {leader.university.short_name || leader.university.name}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-blue-100/90">{leaderSubtitle(leader, summary, content)}</p>
                {leader.compositeScore != null && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-200 ring-1 ring-white/10">
                    Umumiy ball: <span className="font-black text-white">{leader.compositeScore}/100</span>
                  </p>
                )}
                {leader.university.average_rating != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <FractionalStars
                      rating={Number(leader.university.average_rating)}
                      starClassName="text-sm"
                      filledStarClassName="text-amber-400"
                      emptyStarClassName="text-white/25"
                    />
                    <span className="text-xs font-bold tabular-nums text-amber-200">
                      {formatCompareRating(leader.university.average_rating)}/5 reyting
                    </span>
                  </div>
                )}
              </div>
            </div>
            <CompareRecommendBadge
              variant="pill"
              label={content.recommendedLabel}
              className="self-start px-4 py-2 text-xs shadow-[0_8px_24px_-8px_rgba(251,191,36,0.55)] lg:self-center"
            />
          </div>
        ) : (
          <p className="mt-3 text-lg font-black sm:text-xl">Ko&apos;rsatkichlar juda yaqin — jadvalda batafsil qarang</p>
        )}

        {decidedRows > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {universities.map((university, index) => (
              <WinStatCard
                key={university.id}
                university={university}
                index={index}
                wins={winCounts[university.id] ?? 0}
                decidedRows={decidedRows}
                composite={compositeScores.find((item) => item.universityId === university.id)}
                isLeader={leader?.university?.id === university.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
