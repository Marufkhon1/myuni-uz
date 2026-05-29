import { useMemo, useState } from "react";
import ReviewCard from "./ReviewCard.jsx";
import ReviewPanelPlaceholder from "./ReviewPanelPlaceholder.jsx";
import ReviewRatingDistribution from "./ReviewRatingDistribution.jsx";
import UniversityCampusBanner from "../UniversityCampusBanner.jsx";
import UniversityRatingStars from "./UniversityRatingStars.jsx";
import { formatUniversityMetaHeader } from "../UniversityMetaLine.jsx";
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

function StatChip({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        highlight
          ? "border-primary/20 bg-blue-50/90 dark:border-primary/25 dark:bg-blue-400/10"
          : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-1 text-base font-black leading-none ${
          highlight ? "text-primary dark:text-blue-200" : "text-slate-800 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SidebarFact({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-black text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}

function QuickActionButton({ action, onClick, compact = false }) {
  const isPrimary = action.variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isPrimary
          ? `w-full rounded-2xl bg-slate-950 px-4 font-black text-white shadow-soft transition hover:bg-primary dark:bg-white dark:text-slate-950 dark:hover:bg-primary dark:hover:text-white ${
              compact ? "py-2.5 text-xs" : "py-3.5 text-sm"
            }`
          : `w-full rounded-2xl border border-slate-200 bg-white px-4 font-black text-slate-700 transition hover:border-primary hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-primary/40 ${
              compact ? "py-2 text-xs" : "py-3 text-sm"
            }`
      }
    >
      {action.label}
    </button>
  );
}

function ReviewUniversityBanner({
  university,
  bannerEyebrow,
  shortName,
  location,
  averageRating,
  reviewCount,
  metaHeader,
  memberCount,
}) {
  return (
    <div className="relative shrink-0 overflow-hidden">
      <UniversityCampusBanner university={university} className="h-36 sm:h-40 lg:h-[13.5rem]" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">{bannerEyebrow}</p>
            {shortName && (
              <span className="mt-1 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                {shortName}
              </span>
            )}
            <h2 className="mt-1 text-lg font-black leading-snug text-white sm:text-xl">{university?.name}</h2>
            {location && <p className="mt-0.5 text-xs font-semibold text-slate-200">{location}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UniversityRatingStars rating={averageRating} />
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-black text-white backdrop-blur-sm">
              {reviewCount} sharh
            </span>
          </div>
        </div>
        {(metaHeader || memberCount > 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {metaHeader && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
                {metaHeader}
              </span>
            )}
            {memberCount > 0 && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
                {memberCount} chat a&apos;zosi
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewSidebar({
  content,
  reviewUniversityDetail,
  reviewCount,
  averageRating,
  totalLikes,
  memberCount,
  distribution,
  isStudent,
  onOpenSection,
  onOpenChat,
  onQuickAction,
  visibleQuickActions,
}) {
  const avgLikes =
    reviewCount > 0 ? (totalLikes / reviewCount).toFixed(1).replace(/\.0$/, "") : null;
  const tip = isStudent
    ? "Sharh qoldiring yoki chatda talabalar bilan muloqot qiling."
    : "Sharhlarni o'qing, taqqoslang va chatda savol bering.";

  return (
    <aside className="chat-messages-scroll hidden w-full shrink-0 flex-col border-slate-100 bg-slate-50/40 dark:border-white/10 dark:bg-white/[0.02] lg:flex lg:max-h-full lg:w-72 lg:min-h-0 lg:self-stretch lg:overflow-y-auto lg:overscroll-contain lg:border-l xl:w-80">
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{content.statsTitle}</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <StatChip
              label={content.statLabels.rating}
              value={averageRating != null ? `${averageRating}/5` : "—"}
              highlight
            />
            <StatChip label={content.statLabels.reviews} value={reviewCount} />
            <StatChip label={content.statLabels.likes} value={totalLikes} />
            <StatChip label={content.statLabels.chat} value={`${memberCount} a'zo`} />
          </div>
        </div>

        {reviewCount > 0 && distribution && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
              {content.distributionTitle}
            </p>
            <div className="mt-3">
              <ReviewRatingDistribution distribution={distribution} reviewCount={reviewCount} />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Asosiy ma&apos;lumot</p>
          <div className="mt-2 divide-y divide-slate-100 dark:divide-white/10">
            <SidebarFact label="Joylashuv" value={reviewUniversityDetail?.location} />
            <SidebarFact label="Turi" value={reviewUniversityDetail?.institution_type} />
            <SidebarFact
              label="Tashkil etilgan"
              value={reviewUniversityDetail?.founded_year ? `${reviewUniversityDetail.founded_year}-yil` : null}
            />
            <SidebarFact label="Like / sharh" value={avgLikes != null ? `${avgLikes} ta` : null} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{tip}</p>
        </div>

        {onOpenSection && visibleQuickActions.length > 0 && (
          <div className="space-y-2">
            {visibleQuickActions
              .filter((action) => action.variant === "primary")
              .map((action) => (
                <QuickActionButton
                  key={action.id}
                  action={action}
                  compact
                  onClick={() => onQuickAction(action.id)}
                />
              ))}
            {visibleQuickActions.filter((action) => action.variant === "secondary").length > 0 && (
              <div className="grid gap-2">
                {visibleQuickActions
                  .filter((action) => action.variant === "secondary")
                  .map((action) => (
                    <QuickActionButton
                      key={action.id}
                      action={action}
                      compact
                      onClick={() => onQuickAction(action.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {content.notice && (
          <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3 py-3 text-xs leading-5 text-amber-900 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-100">
            {content.notice}
          </p>
        )}
      </div>
    </aside>
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

  const visibleQuickActions = content.quickActions.filter(
    (action) => action.id !== "chat" || onOpenChat
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
      className={`flex min-w-0 flex-col rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] lg:flex lg:max-h-[calc(100dvh-11rem)] lg:overflow-hidden ${className}`}
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

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain">
          <ReviewUniversityBanner
            university={reviewUniversityDetail}
            bannerEyebrow={content.bannerEyebrow}
            shortName={shortName}
            location={reviewUniversityDetail?.location}
            averageRating={averageRating}
            reviewCount={reviewCount}
            metaHeader={metaHeader}
            memberCount={memberCount}
          />

          {reviewUniversityDetail?.summary && (
            <p className="border-b border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:text-slate-300 sm:px-6">
              {reviewUniversityDetail.summary}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:grid-cols-4 lg:hidden">
            <StatChip
              label={content.statLabels.rating}
              value={averageRating != null ? `${averageRating}/5` : "—"}
              highlight
            />
            <StatChip label={content.statLabels.reviews} value={reviewCount} />
            <StatChip label={content.statLabels.likes} value={totalLikes} />
            <StatChip label={content.statLabels.chat} value={`${memberCount} a'zo`} />
          </div>

          {onOpenSection && visibleQuickActions.length > 0 && (
            <div className="space-y-2 border-b border-slate-100 px-5 py-4 dark:border-white/10 lg:hidden">
              {visibleQuickActions
                .filter((action) => action.variant === "primary")
                .map((action) => (
                  <QuickActionButton
                    key={action.id}
                    action={action}
                    compact
                    onClick={() => handleQuickAction(action.id)}
                  />
                ))}
              {visibleQuickActions.filter((action) => action.variant === "secondary").length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {visibleQuickActions
                    .filter((action) => action.variant === "secondary")
                    .map((action) => (
                      <QuickActionButton
                        key={action.id}
                        action={action}
                        compact
                        onClick={() => handleQuickAction(action.id)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {content.notice && (
            <div className="border-b border-amber-200/80 bg-amber-50 px-5 py-3.5 dark:border-amber-400/20 dark:bg-amber-400/10 sm:px-6">
              <p className="text-sm font-semibold leading-6 text-amber-900 dark:text-amber-100">
                {content.notice}
              </p>
            </div>
          )}

          {isStudent && (
            <section className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
              <form
                onSubmit={onSubmitReview}
                className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03] sm:px-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                    {content.formTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Tajribangizni baholang va batafsil yozing — moderatsiyadan o&apos;tgach ko&apos;rinadi.
                  </p>
                </div>

                <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Baho</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex gap-1">
                        {stars.map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => onRatingChange(star)}
                            className={`grid h-10 w-10 place-items-center rounded-xl border text-lg transition sm:h-11 sm:w-11 ${
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
                      <span className="text-sm font-bold text-slate-500">
                        {rating ? `${rating}/5` : "Baho tanlang"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">Sharh matni</p>
                      <span className="text-xs font-semibold text-slate-400">{reviewText.length}/1200</span>
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(event) => onReviewTextChange(event.target.value)}
                      rows={5}
                      maxLength={1200}
                      placeholder={content.formPlaceholder}
                      className="mt-2 min-h-[9rem] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25"
                    />
                  </div>

                  {reviewSubmitError && (
                    <p className="text-sm font-semibold text-red-600">{reviewSubmitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={rating === 0 || !reviewText.trim() || isReviewSubmitting}
                    className="w-full rounded-2xl bg-premium-gradient px-7 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isReviewSubmitting ? "Saqlanmoqda..." : "Sharhni yuborish"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="px-5 py-5 pb-28 sm:px-6 sm:py-6 lg:pb-6">
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
                      <ul className="space-y-3">
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
          </section>
        </div>

        <OverviewSidebar
          content={content}
          reviewUniversityDetail={reviewUniversityDetail}
          reviewCount={reviewCount}
          averageRating={averageRating}
          totalLikes={totalLikes}
          memberCount={memberCount}
          distribution={distribution}
          isStudent={isStudent}
          onOpenSection={onOpenSection}
          onOpenChat={onOpenChat}
          onQuickAction={handleQuickAction}
          visibleQuickActions={visibleQuickActions}
        />
      </div>
    </div>
  );
}
