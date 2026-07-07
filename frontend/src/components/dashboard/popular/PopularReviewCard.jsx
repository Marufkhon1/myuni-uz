import { useState } from "react";
import UserAvatar from "@/components/dashboard/UserAvatar.jsx";
import UniversityAvatar from "@/components/UniversityAvatar.jsx";
import { resolveMediaUrl } from "@/utils/media.js";
import { getPopularRankStyles } from "@/utils/popularReviewRank.js";
import { formatReviewDate } from "@/utils/reviewFormat.js";
import PopularLikeButton from "./PopularLikeButton.jsx";

function StarRating({ rating, size = "sm" }) {
  const textSize = size === "lg" ? "text-base" : "text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 ring-1 ring-amber-200/60 dark:bg-amber-400/10 dark:ring-amber-400/20 ${textSize}`}
      aria-label={`${rating} dan 5 yulduz`}
    >
      <span className="font-bold text-amber-500" aria-hidden="true">
        {"★".repeat(rating)}
        <span className="text-amber-200/90 dark:text-amber-600/40">{"★".repeat(5 - rating)}</span>
      </span>
      <span className="text-xs font-black tabular-nums text-amber-900 dark:text-amber-100">{rating}.0</span>
    </span>
  );
}

function MetaBadge({ children, variant = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    verified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20",
    student: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60 dark:bg-violet-400/10 dark:text-violet-200 dark:ring-violet-400/20",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}

function excerpt(text, max = 200) {
  const trimmed = (text || "").trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max).trim()}…`;
}

export default function PopularReviewCard({
  item,
  rank,
  featured = false,
  onLike,
  onOpenUniversity,
  showStudentVoiceBadge = false,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || featured);
  const themeRank = featured ? 1 : rank;
  const rankTheme = themeRank ? getPopularRankStyles(themeRank) : null;
  const isStudentAuthor = item.author_role === "student";
  const dateLabel = formatReviewDate(item.created_at);
  const universityName = item.university?.short_name || item.university?.name;
  const canExpand = item.text && item.text.length > 200 && !featured;

  const shellClass = rankTheme
    ? `${rankTheme.card} transition duration-200 hover:-translate-y-px`
    : `border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100/80 transition duration-200 hover:-translate-y-px hover:border-slate-300/80 hover:shadow-md dark:border-white/12 dark:bg-slate-800/40 dark:ring-white/8 dark:hover:border-white/20 dark:hover:bg-slate-800/55`;

  const headerBarClass = rankTheme?.headerBar ?? "border-slate-100/90 dark:border-white/10";
  const quoteBoxClass =
    rankTheme?.quoteBox ??
    "border-slate-100 bg-slate-50/50 dark:border-white/12 dark:bg-slate-900/35";

  return (
    <article className={`relative overflow-hidden rounded-2xl ${shellClass}`}>
      {rankTheme?.accentBar && (
        <span
          className={`absolute bottom-0 left-0 top-0 w-1 ${rankTheme.accentBar}`}
          aria-hidden="true"
        />
      )}

      <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5 ${headerBarClass}`}>
        {featured ? (
          <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
            #1 · Kun sharhi
          </span>
        ) : rankTheme ? (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${rankTheme.badge}`}>
            {rankTheme.label}
          </span>
        ) : null}
        <StarRating rating={item.rating} />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-3.5">
          <UserAvatar
            name={item.author}
            avatarUrl={resolveMediaUrl(item.author_avatar_url || "")}
            size={featured ? "md" : "sm"}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-[15px] font-black leading-tight text-slate-950 dark:text-white">
                {item.author}
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.is_verified_student && <MetaBadge variant="verified">✓ Tasdiqlangan</MetaBadge>}
                {showStudentVoiceBadge && isStudentAuthor && !item.is_verified_student && (
                  <MetaBadge variant="student">Talaba tajribasi</MetaBadge>
                )}
              </div>
            </div>

            {universityName && (
              <div>
                {onOpenUniversity && item.university?.id ? (
                  <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 dark:border-white/15 dark:bg-slate-700/50">
                    <UniversityAvatar university={item.university} size="xs" />
                    <button
                      type="button"
                      onClick={() => onOpenUniversity(item.university.id)}
                      className="line-clamp-1 text-left text-xs font-bold text-primary underline-offset-2 transition hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 rounded-sm dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {universityName}
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <UniversityAvatar university={item.university} size="xs" />
                    <span className="line-clamp-1 text-xs font-bold text-primary dark:text-blue-300">{universityName}</span>
                  </div>
                )}
              </div>
            )}

            {dateLabel && (
              <time dateTime={item.created_at} className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {dateLabel}
              </time>
            )}
          </div>
        </div>

        {item.text && (
          <div className={`rounded-xl border px-4 py-3.5 text-sm leading-[1.75] text-slate-700 dark:text-slate-100 ${quoteBoxClass}`}>
            <p className="whitespace-pre-line">{expanded || featured ? item.text : excerpt(item.text)}</p>
            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-2 text-xs font-bold text-primary hover:underline dark:text-blue-300 dark:hover:text-blue-200"
              >
                {expanded ? "Kamroq ko'rsatish" : "To'liq o'qish"}
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
          <PopularLikeButton item={item} onLike={onLike} />
          {onOpenUniversity && item.university?.id && (
            <button
              type="button"
              onClick={() => onOpenUniversity(item.university.id)}
              className="text-xs font-bold text-slate-500 transition hover:text-primary hover:underline dark:text-slate-300 dark:hover:text-blue-300"
            >
              Universitet sahifasi →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

