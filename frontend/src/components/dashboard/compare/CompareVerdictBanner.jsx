import UniversityAvatar from "../../UniversityAvatar.jsx";
import CompareStarBadge from "./CompareStarBadge.jsx";
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
          <span className="text-blue-300/90">
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
      {tieRows > 0 && (
        <span className="text-blue-300/90"> · {tieRows} ta durang</span>
      )}
      {leader.university.average_rating != null && (
        <span className="ml-1 inline-flex align-middle">
          <CompareStarBadge rating={leader.university.average_rating} size="sm" />
        </span>
      )}
    </>
  );
}

export default function CompareVerdictBanner({ summary, content }) {
  const { universities, winCounts, decidedRows, tieRows, leader, compositeScores } = summary;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f2744] to-primary/90 text-white ring-1 ring-white/10">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/90">
            {content.verdictTitle}
          </p>
          {decidedRows > 0 && (
            <p className="text-[10px] font-semibold text-slate-400">
              {decidedRows} ta qator hal qilindi
              {tieRows > 0 ? ` · ${tieRows} durang` : ""}
            </p>
          )}
        </div>

        {leader?.university ? (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <UniversityAvatar university={leader.university} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black sm:text-2xl">
                {leader.university.short_name || leader.university.name}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-blue-200">
                {leaderSubtitle(leader, summary, content)}
              </p>
              {leader.compositeScore != null && summary.leaderSource === "wins" && (
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  Umumiy ball: {leader.compositeScore}/100
                </p>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-black text-amber-950 shadow-lg shadow-amber-900/20">
              🏆 {content.recommendedLabel}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-lg font-black sm:text-xl">
            Ko&apos;rsatkichlar juda yaqin — jadvalda batafsil qarang
          </p>
        )}

        {decidedRows > 0 && (
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {universities.map((university, index) => {
              const wins = winCounts[university.id] ?? 0;
              const pct = winSharePercent(wins, decidedRows);
              const composite = compositeScores.find((item) => item.universityId === university.id);
              const colors = [
                "from-blue-400 to-primary",
                "from-violet-400 to-violet-600",
                "from-emerald-400 to-emerald-600",
              ];
              const isLeader = leader?.university?.id === university.id;

              return (
                <div
                  key={university.id}
                  className={`rounded-xl px-3 py-2.5 ring-1 ${
                    isLeader ? "bg-white/15 ring-amber-400/40" : "bg-white/10 ring-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold text-blue-100">
                      {university.short_name}
                    </span>
                    <span className="text-xs font-black tabular-nums text-white">
                      {wins}/{decidedRows}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-700`}
                      style={{ width: `${Math.max(pct, wins > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1 text-[10px] font-semibold text-slate-400">
                    <span>{pct}% g&apos;alaba</span>
                    {composite != null && (
                      <span className="tabular-nums text-slate-500">{composite.score} ball</span>
                    )}
                  </div>
                  {university.average_rating != null && (
                    <p className="mt-1 text-[10px] tabular-nums text-blue-200/80">
                      Reyting: {formatCompareRating(university.average_rating)}/5
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
