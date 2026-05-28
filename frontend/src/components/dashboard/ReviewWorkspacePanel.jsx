import { useMemo, useState } from "react";
import ReviewCard from "./ReviewCard.jsx";
import ReviewPanelPlaceholder from "./ReviewPanelPlaceholder.jsx";
import ReviewRatingDistribution from "./ReviewRatingDistribution.jsx";
import UniversityCampusBanner from "../UniversityCampusBanner.jsx";
import UniversityRatingStars from "./UniversityRatingStars.jsx";
import { formatUniversityMetaHeader } from "../UniversityMetaLine.jsx";
import ReviewUniversityInsights from "./ReviewUniversityInsights.jsx";
import { getReviewPanelContent, getReviewSortOptions } from "../../utils/reviewRoleContent.js";

function sortReviews(list, sortId) {
  const items = [...list];
  switch (sortId) {
    case "likes":
      return items.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));
    case "rating_high":
      return items.sort((a, b) => b.rating - a.rating || b.id - a.id);
    case "oldest":
      return items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    default:
      return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

function StatTile({ label, value, accent = "none" }) {
  const accentClass =
    accent === "primary"
      ? "border-primary/20 bg-blue-50/90 dark:border-primary/25 dark:bg-blue-400/10"
      : "border-slate-200/70 bg-white dark:border-white/10 dark:bg-white/[0.04]";
  const valueClass =
    accent === "primary"
      ? "text-primary dark:text-blue-200"
      : "text-slate-800 dark:text-white";

  return (
    <div className={`flex min-h-[4.25rem] flex-col justify-center rounded-2xl border px-4 py-3 ${accentClass}`}>
      <p className="text-[11px] font-black uppercase leading-tight tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1.5 text-lg font-black leading-none ${valueClass}`}>{value}</p>
    </div>
  );
}

function QuickActionButton({ action, onClick }) {
  const isPrimary = action.variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isPrimary
          ? "w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-soft transition hover:bg-primary dark:bg-white dark:text-slate-950 dark:hover:bg-primary dark:hover:text-white"
          : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-primary hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-primary/40"
      }
    >
      {action.label}
    </button>
  );
}

export default function ReviewWorkspacePanel({
  isStudent,
  isPhone,
  reviewUniversity,
  reviewUniversityDetail,
  isReviewDetailLoading,
  reviews,
  onBack,
  onSubmitReview,
  rating,
  onRatingChange,
  reviewText,
  onReviewTextChange,
  isReviewSubmitting,
  reviewSubmitError,
  onLike,
  onDeleteReview,
  stars,
  onOpenSection,
  onOpenChat,
  className = "",
}) {
  const content = getReviewPanelContent(isStudent);
  const sortOptions = getReviewSortOptions(isStudent);
  const [sortId, setSortId] = useState(content.defaultSort);
  const [ratingFilter, setRatingFilter] = useState("all");

  const filteredAndSortedReviews = useMemo(() => {
    let list = reviews;
    if (ratingFilter !== "all") {
      const star = Number(ratingFilter);
      list = list.filter((item) => item.rating === star);
    }
    return sortReviews(list, sortId);
  }, [reviews, sortId, ratingFilter]);

  const topLikedReview = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }
    return [...reviews].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))[0];
  }, [reviews]);

  const showFeaturedTop =
    topLikedReview &&
    (topLikedReview.like_count ?? 0) > 0 &&
    ratingFilter === "all" &&
    (sortId === "newest" || sortId === "likes");

  const listReviews = useMemo(() => {
    if (!showFeaturedTop) {
      return filteredAndSortedReviews;
    }
    return filteredAndSortedReviews.filter((item) => item.id !== topLikedReview.id);
  }, [filteredAndSortedReviews, showFeaturedTop, topLikedReview]);

  const totalLikes = useMemo(
    () => reviews.reduce((sum, item) => sum + (item.like_count ?? 0), 0),
    [reviews]
  );

  function handleQuickAction(actionId) {
    if (actionId === "chat" && onOpenChat) {
      onOpenChat();
      return;
    }
    if (onOpenSection) {
      onOpenSection(actionId === "popular" ? "popular" : "compare");
    }
  }

  if (!reviewUniversity) {
    return (
      <ReviewPanelPlaceholder
        className={className}
        title={content.placeholderTitle}
        description={content.placeholderDescription}
      />
    );
  }

  if (isReviewDetailLoading) {
    return (
      <div
        className={`grid min-h-[min(420px,calc(100dvh-14rem))] place-items-center rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] ${className}`}
      >
        <p className="font-black text-primary">Ma&apos;lumot yuklanmoqda...</p>
      </div>
    );
  }

  const shortName = reviewUniversityDetail?.short_name;
  const averageRating = reviewUniversityDetail?.average_rating;
  const reviewCount = reviewUniversityDetail?.review_count ?? 0;
  const memberCount = reviewUniversityDetail?.member_count ?? 0;
  const metaHeader = formatUniversityMetaHeader(reviewUniversityDetail);
  const distribution = reviewUniversityDetail?.rating_distribution;

  return (
    <div
      className={`flex min-h-[min(520px,calc(100dvh-11rem))] max-h-[calc(100dvh-11rem)] min-w-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] md:max-h-[calc(100vh-10rem)] ${className}`}
    >
      {isPhone && (
        <div className="shrink-0 border-b border-slate-100 px-5 py-3 dark:border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-black text-primary"
          >
            ← Universitetlar
          </button>
        </div>
      )}

      <div className="relative shrink-0 overflow-hidden">
        <UniversityCampusBanner university={reviewUniversityDetail} className="h-32 sm:h-36" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            {content.bannerEyebrow}
          </p>
          <h2 className="mt-0.5 text-lg font-black leading-snug text-white sm:text-xl">
            {reviewUniversityDetail?.name}
          </h2>
          {reviewUniversityDetail?.location && (
            <p className="mt-0.5 text-xs font-semibold text-slate-200">{reviewUniversityDetail.location}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <UniversityRatingStars rating={averageRating} />
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-black text-white backdrop-blur-sm">
              {reviewCount} ta sharh
            </span>
            {memberCount > 0 && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
                {memberCount} chat a&apos;zosi
              </span>
            )}
            {metaHeader && (
              <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm sm:inline">
                {metaHeader}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {metaHeader && (
          <p className="border-b border-slate-100 px-5 py-2.5 text-xs font-semibold text-primary dark:border-white/10 sm:hidden">
            {metaHeader}
          </p>
        )}

        {reviewUniversityDetail?.summary && (
          <p className="border-b border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:text-slate-300 sm:px-6 sm:py-5">
            {reviewUniversityDetail.summary}
          </p>
        )}

        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
          <ReviewUniversityInsights
            university={reviewUniversityDetail}
            isStudent={isStudent}
            reviewCount={reviewCount}
            averageRating={averageRating}
            totalLikes={totalLikes}
            memberCount={memberCount}
          />
        </div>

        <div className="space-y-5 border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6 sm:py-6">
          <section className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{content.statsTitle}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile
                label={content.statLabels.rating}
                value={averageRating != null ? `${averageRating}/5` : "—"}
                accent="primary"
              />
              <StatTile label={content.statLabels.reviews} value={reviewCount} />
              <StatTile label={content.statLabels.likes} value={totalLikes} />
              <StatTile label={content.statLabels.chat} value={`${memberCount} a'zo`} />
            </div>

            {reviewCount > 0 && distribution && (
              <div className="mt-5 border-t border-slate-200/80 pt-5 dark:border-white/10">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  {content.distributionTitle}
                </p>
                <div className="mt-3">
                  <ReviewRatingDistribution distribution={distribution} reviewCount={reviewCount} />
                </div>
              </div>
            )}
          </section>

          {onOpenSection && (
            <section className="space-y-2.5">
              {content.quickActions
                .filter((action) => action.id !== "chat" || onOpenChat)
                .filter((action) => action.variant === "primary")
                .map((action) => (
                  <QuickActionButton
                    key={action.id}
                    action={action}
                    onClick={() => handleQuickAction(action.id)}
                  />
                ))}
              {content.quickActions.filter(
                (action) =>
                  action.variant === "secondary" && (action.id !== "chat" || onOpenChat)
              ).length > 0 && (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {content.quickActions
                    .filter(
                      (action) =>
                        action.variant === "secondary" && (action.id !== "chat" || onOpenChat)
                    )
                    .map((action) => (
                      <QuickActionButton
                        key={action.id}
                        action={action}
                        onClick={() => handleQuickAction(action.id)}
                      />
                    ))}
                </div>
              )}
            </section>
          )}

          {content.notice && (
            <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-left">
              {content.notice}
            </p>
          )}
        </div>

        {isStudent && (
          <div className="border-b border-slate-100 px-5 py-3 dark:border-white/10 sm:px-6">
            <form
              onSubmit={onSubmitReview}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.04] sm:p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wide text-primary">
                  {content.formTitle}
                </span>
                <div className="flex gap-1">
                  {stars.map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onRatingChange(star)}
                      className={`grid h-10 w-10 place-items-center rounded-xl border text-lg transition sm:h-11 sm:w-11 sm:text-xl ${
                        star <= rating
                          ? "border-amber-300 bg-amber-50 text-amber-500 shadow-sm"
                          : "border-slate-200 bg-white text-slate-300 hover:border-amber-200 dark:border-white/10 dark:bg-white/5"
                      }`}
                      aria-label={`${star} yulduz`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-500">{rating ? `${rating}/5` : "Baho tanlang"}</span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <textarea
                  value={reviewText}
                  onChange={(event) => onReviewTextChange(event.target.value)}
                  rows={5}
                  maxLength={1200}
                  placeholder={content.formPlaceholder}
                  className="min-h-[9.5rem] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25 sm:min-h-[10.5rem]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={rating === 0 || !reviewText.trim() || isReviewSubmitting}
                    className="rounded-xl bg-premium-gradient px-7 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isReviewSubmitting ? "Saqlanmoqda..." : "Sharhni yuborish"}
                  </button>
                </div>
              </div>

              {reviewSubmitError && (
                <p className="mt-2.5 text-sm font-semibold text-red-600">{reviewSubmitError}</p>
              )}
            </form>
          </div>
        )}

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                {content.reviewsHeading}
              </p>
              <h3 className="mt-0.5 text-base font-black text-slate-950 dark:text-white sm:text-lg">
                {shortName ? `${shortName} sharhlari` : content.reviewsSubheading}
              </h3>
            </div>
            {reviews.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="review-sort">
                  Saralash
                </label>
                <select
                  id="review-sort"
                  value={sortId}
                  onChange={(event) => setSortId(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary dark:border-white/15 dark:bg-slate-800 dark:text-slate-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {filteredAndSortedReviews.length}
                  {ratingFilter !== "all" ? ` / ${reviews.length}` : ""}
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["all", "5", "4", "3", "2", "1"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatingFilter(value)}
                  className={`rounded-full px-3 py-1 text-[11px] font-black transition ${
                    ratingFilter === value
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {value === "all" ? "Hammasi" : `${value} ★`}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-lg font-black text-slate-800 dark:text-white">{content.emptyTitle}</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{content.emptyHint}</p>
              </div>
            ) : (
              <>
                {showFeaturedTop && (
                  <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-primary">
                      {content.featuredLabel}
                    </p>
                    <ReviewCard
                      item={topLikedReview}
                      onLike={onLike}
                      onDelete={isStudent ? onDeleteReview : undefined}
                      elevated
                      likeLabel={content.likeButtonLabel}
                      showMineBadge={isStudent}
                      showStudentVoiceBadge={!isStudent}
                    />
                  </div>
                )}

                {listReviews.length === 0 && !showFeaturedTop ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500 dark:bg-white/5">
                    Bu bahoda sharh topilmadi.
                  </p>
                ) : (
                  listReviews.length > 0 && (
                    <ul className={`grid gap-3 ${listReviews.length > 1 ? "lg:grid-cols-2" : ""}`}>
                      {listReviews.map((item) => (
                        <li key={item.id}>
                          <ReviewCard
                            item={item}
                            onLike={onLike}
                            onDelete={isStudent ? onDeleteReview : undefined}
                            elevated
                            likeLabel={content.likeButtonLabel}
                            showMineBadge={isStudent}
                            showStudentVoiceBadge={!isStudent}
                          />
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
