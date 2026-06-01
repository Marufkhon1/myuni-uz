import UserAvatar from "./UserAvatar.jsx";
import UniversityAvatar from "../UniversityAvatar.jsx";
import ReviewAspectRatings, { formatReviewDate } from "../reviews/ReviewAspectRatings.jsx";
import { resolveMediaUrl } from "../../utils/media.js";
import { getPopularRankStyles } from "../../utils/popularReviewRank.js";
const STATUS_LABELS = {
  pending: "Ko'rib chiqilmoqda",
  rejected: "Rad etilgan",
};

function StarRatingPill({ value, large = false }) {
  return (
    <div
      className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-amber-50 ring-1 ring-amber-200/70 dark:bg-amber-400/10 dark:ring-amber-400/25 ${
        large ? "px-2 py-0.5" : "px-1.5 py-0.5"
      }`}
      aria-label={`${value} dan 5 yulduz`}
    >
      <span className={`leading-none text-amber-500 ${large ? "text-sm" : "text-xs"}`}>
        {"★".repeat(value)}
        <span className="text-amber-200 dark:text-amber-500/25">{"★".repeat(5 - value)}</span>
      </span>
      <span
        className={`font-black tabular-nums text-amber-800 dark:text-amber-200 ${
          large ? "text-xs" : "text-[10px]"
        }`}
      >
        {value}.0
      </span>
    </div>
  );
}

function ReviewBadge({ children, variant = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    verified:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20",
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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${styles[variant] || styles.default}`}
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
          className="whitespace-pre-line text-[15px] leading-[1.85] text-slate-700 dark:text-slate-200"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function LikeButton({ item, onLike, likeLabel, helpfulCount }) {
  return (
    <button
      type="button"
      onClick={() => onLike(item.id)}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition active:scale-[0.98] ${
        item.liked_by_me
          ? "bg-primary text-white shadow-sm shadow-primary/20"
          : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:bg-primary hover:text-white hover:ring-primary/30 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-primary dark:hover:text-white"
      }`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {item.liked_by_me ? "♥" : "♡"}
      </span>
      {likeLabel}
      <span
        className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
          item.liked_by_me ? "bg-white/20" : "bg-black/5 dark:bg-white/10"
        }`}
      >
        {helpfulCount}
      </span>
    </button>
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
  const hasAspects =
    item.rating_teachers != null ||
    item.rating_dormitory != null ||
    item.rating_infrastructure != null;
  const avatarSize = featured ? "lg" : "md";
  const contentInsetClass = featured ? "w-14 sm:w-14" : "w-12";
  const rankStyles = popularRank ? getPopularRankStyles(popularRank) : null;

  const cardSurfaceClass = rankStyles
    ? rankStyles.card
    : featured
      ? "border border-primary/20 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/30 shadow-soft ring-1 ring-primary/10 dark:border-primary/25 dark:from-blue-400/10 dark:via-white/[0.05] dark:to-violet-400/5"
      : elevated
        ? "border border-slate-200/80 bg-white shadow-sm hover:border-slate-300/80 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/15"
        : "border border-slate-200/70 bg-white dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl transition ${cardSurfaceClass}`}
    >
      {featured && (
        <div className="flex items-center justify-between gap-3 border-b border-primary/10 bg-gradient-to-r from-primary/8 to-transparent px-5 py-2.5 dark:border-primary/15 dark:from-primary/15">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">
            {featuredLabel}
          </p>
          <StarRatingPill value={item.rating} />
        </div>
      )}

      {popularRank && rankStyles && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${rankStyles.badge}`}
          >
            {rankStyles.label}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
            ♥ {helpfulCount}
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex gap-3.5 sm:gap-4">
          <div className="shrink-0">
            <UserAvatar
              name={item.author}
              avatarUrl={resolveMediaUrl(item.author_avatar_url || "")}
              size={avatarSize}
            />
          </div>

          <div className={`min-w-0 flex-1 ${popularRank ? "pt-12 sm:pt-0 sm:pr-28" : ""}`}>
            {popularRank === 1 && (
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                Lider sharh
              </p>
            )}
            <h3 className="text-base font-black tracking-tight text-slate-950 dark:text-white sm:text-[1.05rem]">
              {item.author}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {item.is_verified_student && (
                <ReviewBadge variant="verified">✓ Tasdiqlangan talaba</ReviewBadge>
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

            <div className="mt-4 space-y-2.5">
              {showUniversity && item.university?.name && (
                <div>
                  {onOpenUniversity ? (
                    <button
                      type="button"
                      onClick={() => onOpenUniversity(item.university.id)}
                      className="flex items-center gap-2.5 text-left text-sm font-bold leading-relaxed text-primary transition hover:underline"
                    >
                      <UniversityAvatar university={item.university} size="sm" />
                      <span>{item.university.name}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <UniversityAvatar university={item.university} size="sm" />
                      <p className="text-sm font-bold leading-relaxed text-primary">
                        {item.university.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {dateLabel ? (
                <time
                  dateTime={item.created_at}
                  className="block text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400"
                >
                  {dateLabel}
                </time>
              ) : null}

              {item.study_direction_name ? (
                <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  Yo&apos;nalish: {item.study_direction_name}
                </p>
              ) : null}
            </div>

            {!featured && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <StarRatingPill value={item.rating} />
                {hasAspects ? <ReviewAspectRatings item={item} variant="inline" /> : null}
              </div>
            )}
          </div>
        </div>

        {(item.text || (!hideLike && onLike) || onReport || (item.is_mine && onDelete)) && (
          <div className="mt-4 flex gap-3.5 sm:gap-4">
            <div className={`${contentInsetClass} shrink-0`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {item.text ? <ReviewTextBody text={item.text} /> : null}
              {(onLike || onReport || (item.is_mine && onDelete)) && (
                <div className={`flex flex-wrap items-center gap-2 ${item.text ? "mt-4" : ""}`}>
                  {!hideLike && onLike && (
                    <LikeButton
                      item={item}
                      onLike={onLike}
                      likeLabel={likeLabel}
                      helpfulCount={helpfulCount}
                    />
                  )}
                  {showHelpfulCount && helpfulCount > 0 && (
                    <span className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-600 ring-1 ring-slate-200/80 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                      Foydali: {helpfulCount}
                    </span>
                  )}
                  {onReport && !item.is_mine && (
                    <button
                      type="button"
                      onClick={() => onReport(item)}
                      className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-300"
                    >
                      Shikoyat
                    </button>
                  )}
                  {item.is_mine && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-black text-red-600 ring-1 ring-red-200/80 transition hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300 dark:ring-red-400/25"
                    >
                      O&apos;chirish
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {item.official_reply?.text && (
          <div className="mt-5 rounded-xl border-l-[3px] border-primary bg-blue-50/60 px-4 py-3 dark:bg-blue-400/10">
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
