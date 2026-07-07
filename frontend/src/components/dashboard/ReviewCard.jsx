import UserAvatar from "./UserAvatar.jsx";
import IconDeleteButton from "../ui/IconDeleteButton.jsx";
import UniversityAvatar from "../UniversityAvatar.jsx";
import ReviewAspectRatings from "../reviews/ReviewAspectRatings.jsx";
import { formatReviewDate } from "@/utils/reviewFormat.js";
import HelpfulLikeButton from "../reviews/HelpfulLikeButton.jsx";
import { FractionalStars } from "../ui/StarRatingDisplay.jsx";
import { resolveMediaUrl } from "@/utils/media.js";
import { getPopularRankStyles } from "@/utils/popularReviewRank.js";
import { hasReviewAspectRatings } from "@/utils/reviewAspects.js";

const STATUS_LABELS = {
  pending: "Ko'rib chiqilmoqda",
  rejected: "Rad etilgan",
};

function StarRatingPill({ value, large = false }) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  const scoreLabel =
    numeric % 1 === 0 ? `${Math.round(numeric)}/5` : `${numeric.toFixed(1)}/5`;

  return (
    <div
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 ring-1 ring-amber-200/70 dark:from-amber-500/10 dark:to-orange-500/5 dark:ring-amber-400/25 ${
        large ? "px-3 py-1.5" : "px-2.5 py-1"
      }`}
      aria-label={`${scoreLabel} yulduz`}
    >
      <FractionalStars
        rating={numeric}
        starClassName={large ? "text-sm" : "text-xs"}
        filledStarClassName="text-amber-400"
        emptyStarClassName="text-amber-200/90 dark:text-amber-500/25"
      />
      <span
        className={`font-black tabular-nums text-amber-900 dark:text-amber-200 ${
          large ? "text-sm" : "text-xs"
        }`}
      >
        {scoreLabel}
      </span>
    </div>
  );
}

function ReviewBadge({ children, variant = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    verified:
      "gap-1 bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-300/50 dark:bg-emerald-400/12 dark:text-emerald-300 dark:ring-emerald-400/25",
    mine: "bg-blue-50 text-primary ring-1 ring-inset ring-blue-200/70 dark:bg-blue-400/10 dark:ring-blue-400/20",
    student:
      "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/70 dark:bg-violet-400/10 dark:ring-violet-200/20",
    applicant:
      "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/70 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20",
    pending:
      "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/70 dark:bg-amber-400/10 dark:text-amber-200",
    rejected:
      "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/70 dark:bg-red-400/10 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${styles[variant] || styles.default}`}
    >
      {children}
    </span>
  );
}

function ReviewTextBody({ text }) {
  const paragraphs = (text || "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const blocks = paragraphs.length > 0 ? paragraphs : [text || ""];

  return (
    <div className="space-y-3">
      {blocks.map((paragraph, index) => (
        <p
          key={index}
          className="whitespace-pre-line text-[15px] leading-[1.85] text-slate-700 dark:text-slate-100"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default function ReviewCard({
  item,
  showUniversity = false,
  onLike,
  onDelete,
  onReport,
  onOpenUniversity,
  elevated = false,
  featured = false,
  featuredLabel = "Eng ko'p yoqqan sharh",
  likeLabel = "Foydali",
  showMineBadge = false,
  showStudentVoiceBadge = false,
  showApplicantVoiceBadge = false,
  hideLike = false,
  showHelpfulCount = false,
  popularRank,
}) {
  const isStudentAuthor = item.author_role === "student";
  const isApplicantAuthor = item.author_role === "applicant";
  const helpfulCount = item.helpful_count ?? item.like_count ?? 0;
  const dateLabel = formatReviewDate(item.created_at);
  const hasAspects = hasReviewAspectRatings(item);
  const isCompactCard = !hasAspects && !featured;
  const avatarSize = featured ? "lg" : isCompactCard ? "sm" : "md";
  const rankStyles = popularRank ? getPopularRankStyles(popularRank) : null;
  const hasFooterActions = onLike || onReport;
  const showHelpfulCountText = showHelpfulCount && (hideLike || !onLike) && helpfulCount > 0;
  const showFooterRating = !featured && item.rating;
  const showFooterBar = showFooterRating || showHelpfulCountText || hasFooterActions;

  const cardSurfaceClass = rankStyles
    ? rankStyles.card
    : featured
      ? "border border-primary/20 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/30 shadow-soft ring-1 ring-primary/10 dark:border-primary/25 dark:from-blue-400/10 dark:via-white/[0.05] dark:to-violet-400/5"
      : elevated
        ? "border border-slate-200/80 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/15"
        : "border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:border-slate-300/70 hover:shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/15 dark:hover:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)]";

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] transition ${cardSurfaceClass}`}
    >
      {rankStyles?.accentBar && (
        <span
          className={`absolute bottom-0 left-0 top-0 w-1 ${rankStyles.accentBar}`}
          aria-hidden="true"
        />
      )}

      {featured && (
        <div className="flex items-center justify-between gap-3 border-b border-primary/10 bg-gradient-to-r from-primary/8 to-transparent px-5 py-2.5 dark:border-primary/15 dark:from-primary/15">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">
            {featuredLabel}
          </p>
          <StarRatingPill value={item.rating} />
        </div>
      )}

      {popularRank && rankStyles && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b px-5 py-2.5 sm:px-6 ${rankStyles.headerBar}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${rankStyles.badge}`}>
              {rankStyles.label}
            </span>
            {popularRank === 1 && (
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-800/80 dark:text-amber-200/90">
                Lider sharh
              </span>
            )}
          </div>
          <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
            ♥ {helpfulCount} foydali
          </span>
        </div>
      )}

      <div className={`relative ${isCompactCard ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}>
        {item.is_mine && onDelete ? (
          <IconDeleteButton
            onClick={() => onDelete(item.id)}
            className="absolute right-4 top-4 z-10 sm:right-5 sm:top-5"
            ariaLabel="Sharhni o'chirish"
            title="Sharhni o'chirish"
          />
        ) : null}

        <div
          className={`flex gap-3 ${isCompactCard ? "" : "sm:gap-4"} ${
            item.is_mine && onDelete ? "pr-11 sm:pr-12" : ""
          }`}
        >
          <div className="shrink-0">
            <UserAvatar
              name={item.author}
              userId={item.author_id}
              avatarUrl={resolveMediaUrl(item.author_avatar_url || "")}
              size={avatarSize}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h3 className="text-base font-black tracking-tight text-slate-950 dark:text-white sm:text-[1.05rem]">
                {item.author}
              </h3>
              {item.is_verified_student && (
                <ReviewBadge variant="verified">
                  <span aria-hidden="true">✓</span> Tasdiqlangan
                </ReviewBadge>
              )}
              {showStudentVoiceBadge && isStudentAuthor && !item.is_verified_student && (
                <ReviewBadge variant="student">Talaba tajribasi</ReviewBadge>
              )}
              {showApplicantVoiceBadge && isApplicantAuthor && (
                <ReviewBadge variant="applicant">Abituriyent fikri</ReviewBadge>
              )}
              {showMineBadge && item.is_mine && (
                <ReviewBadge variant="mine">Sizning sharhingiz</ReviewBadge>
              )}
              {item.status === "pending" && (
                <ReviewBadge variant="pending">{STATUS_LABELS.pending}</ReviewBadge>
              )}
              {item.status === "rejected" && (
                <ReviewBadge variant="rejected">{STATUS_LABELS.rejected}</ReviewBadge>
              )}
            </div>

            {showUniversity && item.university?.name && (
              <div className="mt-2">
                {onOpenUniversity ? (
                  <button
                    type="button"
                    onClick={() => onOpenUniversity(item.university.id)}
                    className="inline-flex max-w-full items-center gap-2 rounded-lg text-left text-sm font-bold text-primary transition hover:underline"
                  >
                    <UniversityAvatar university={item.university} size="sm" />
                    <span className="line-clamp-1">
                      {item.university.short_name || item.university.name}
                    </span>
                  </button>
                ) : (
                  <div className="inline-flex max-w-full items-center gap-2">
                    <UniversityAvatar university={item.university} size="sm" />
                    <p className="line-clamp-1 text-sm font-bold text-primary">
                      {item.university.short_name || item.university.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {item.study_direction_name ? (
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Yo&apos;nalish: {item.study_direction_name}
              </p>
            ) : null}

            {dateLabel ? (
              <time
                dateTime={item.created_at}
                className="mt-1.5 block text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500"
              >
                {dateLabel}
              </time>
            ) : null}
          </div>
        </div>

        {item.text ? (
          isCompactCard ? (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-700 dark:text-slate-100">
              {item.text}
            </p>
          ) : (
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/90 via-white to-slate-50/40 px-4 py-4 dark:border-white/10 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent sm:px-5 sm:py-5">
              <span
                className="pointer-events-none absolute left-3 top-2 text-5xl font-serif leading-none text-primary/12 dark:text-blue-400/15"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <div className="relative pl-1">
                <ReviewTextBody text={item.text} />
              </div>
            </div>
          )
        ) : null}

        {hasAspects && !featured ? (
          <div className="mt-5">
            <ReviewAspectRatings item={item} variant="chip" />
          </div>
        ) : null}

        {showFooterBar ? (
          <div
            className={`flex flex-wrap items-center gap-2 ${
              showFooterRating ? "justify-between" : "justify-end"
            } ${
              item.text || hasAspects
                ? isCompactCard
                  ? "mt-3 border-t border-slate-100/80 pt-3 dark:border-white/10"
                  : "mt-5 border-t border-slate-100 pt-4 dark:border-white/10"
                : isCompactCard
                  ? "mt-3"
                  : "mt-5"
            }`}
          >
            {showFooterRating ? <StarRatingPill value={item.rating} /> : null}

            <div className="flex flex-wrap items-center gap-2">
              {showHelpfulCountText ? (
                <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                  Foydali: {helpfulCount}
                </span>
              ) : null}
              {!hideLike && onLike && (
                <HelpfulLikeButton item={item} onLike={onLike} label={likeLabel} shape="rounded" />
              )}
              {onReport && !item.is_mine && (
                <button
                  type="button"
                  onClick={() => onReport(item)}
                  className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
                >
                  Shikoyat
                </button>
              )}
            </div>
          </div>
        ) : null}

        {item.official_reply?.text && (
          <div className="mt-5 rounded-2xl border-l-[3px] border-primary bg-blue-50/60 px-4 py-3.5 dark:bg-blue-400/10">
            <p className="text-[10px] font-black uppercase tracking-wide text-primary">
              Rasmiy javob · {item.official_reply.author}
            </p>
            <p className="mt-1.5 text-sm leading-7 text-slate-700 dark:text-slate-200">
              {item.official_reply.text}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
