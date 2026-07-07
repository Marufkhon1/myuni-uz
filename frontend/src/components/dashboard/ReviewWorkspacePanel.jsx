import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard.js";
import EmptyState from "../ui/EmptyState.jsx";
import ReviewCard from "./ReviewCard.jsx";
import ReviewPanelPlaceholder from "./ReviewPanelPlaceholder.jsx";
import ReviewComposeForm from "../reviews/ReviewComposeForm.jsx";
import ReviewSectionHeader from "../reviews/ReviewSectionHeader.jsx";
import ReviewUniversityProfile from "./ReviewUniversityProfile.jsx";
import ReviewFeedControls from "../reviews/ReviewFeedControls.jsx";
import { buildReviewFeedSummary } from "@/utils/reviewFeedSummary.js";
import { ReviewPanelSkeleton } from "../skeletons/DashboardSkeletons.jsx";
import ReviewWorkspaceHero from "./ReviewWorkspaceHero.jsx";
import { formatUniversityMetaHeader } from "@/utils/universityMetaFormat.js";
import { scrollElementIntoView } from "@/utils/scrollIntoView.js";
import { getReviewPanelContent, getReviewSortOptions } from "@/utils/reviewRoleContent.js";

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
      className={`rounded-xl px-3 py-2.5 ${
        highlight
          ? "bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15 dark:ring-primary/30"
          : "bg-white ring-1 ring-slate-200/80 dark:bg-white/[0.04] dark:ring-white/10"
      }`}
    >
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-base font-black leading-none tabular-nums ${
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

function OverviewSidebar({
  content,
  reviewUniversityDetail,
  reviewCount,
  averageRating,
  totalLikes,
  memberCount,
  isStudent,
}) {
  const avgLikes =
    reviewCount > 0 ? (totalLikes / reviewCount).toFixed(1).replace(/\.0$/, "") : null;
  const tip = isStudent
    ? "Sharh qoldiring yoki chatda talabalar bilan muloqot qiling."
    : "Sharhlarni o'qing, taqqoslang va chatda savol bering.";

  return (
    <aside className="chat-messages-scroll relative z-10 hidden w-full shrink-0 flex-col overflow-x-hidden border-slate-200/60 bg-slate-50/80 dark:border-white/10 dark:bg-[#0b1220] @[960px]:flex @[960px]:max-h-full @[960px]:w-[280px] @[960px]:max-w-[280px] @[960px]:min-h-0 @[960px]:overflow-y-auto @[960px]:overscroll-contain @[960px]:border-l">
      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{content.statsTitle}</p>
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

        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Asosiy ma&apos;lumot</p>
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
  isPhone,
  reviewUniversity,
  reviewUniversityDetail,
  isReviewDetailLoading,
  reviews,
  onBack,
  onSubmitReview,
  rating,
  onRatingChange,
  aspectRatings,
  onAspectChange,
  studyDirectionId,
  onStudyDirectionChange,
  reviewText,
  onReviewTextChange,
  isReviewSubmitting,
  onLike,
  onOpenChat,
  className = "",
}) {
  const { isStudent, changeSection, openReviewReport, requestDeleteReview } = useDashboard();
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

  const renderedReviews = useMemo(() => {
    return filteredAndSortedReviews.map((item) => ({
      item,
      featured: showFeaturedTop && item.id === topLikedReview.id,
    }));
  }, [filteredAndSortedReviews, showFeaturedTop, topLikedReview]);

  const totalLikes = useMemo(
    () => reviews.reduce((sum, item) => sum + (item.like_count ?? 0), 0),
    [reviews]
  );

  const activeSortLabel =
    sortOptions.find((option) => option.id === sortId)?.label ?? sortOptions[0]?.label ?? "";
  const feedSummary =
    reviews.length > 0
      ? buildReviewFeedSummary({
          filteredCount: filteredAndSortedReviews.length,
          totalCount: reviews.length,
          ratingFilter,
          sortLabel: activeSortLabel,
        })
      : "";

  if (!reviewUniversity) {
    return (
      <ReviewPanelPlaceholder
        className={className}
        isStudent={isStudent}
        title={content.placeholderTitle}
        description={content.placeholderDescription}
      />
    );
  }

  if (isReviewDetailLoading || (reviewUniversity && !reviewUniversityDetail)) {
    return <ReviewPanelSkeleton className={className} />;
  }

  const shortName = reviewUniversityDetail?.short_name;
  const averageRating = reviewUniversityDetail?.average_rating;
  const reviewCount = reviewUniversityDetail?.review_count ?? 0;
  const memberCount = reviewUniversityDetail?.member_count ?? 0;
  const metaHeader = formatUniversityMetaHeader(reviewUniversityDetail);
  const distribution = reviewUniversityDetail?.rating_distribution;
  const aspectAverages = reviewUniversityDetail?.aspect_averages;
  const insightSummary = reviewUniversityDetail?.review_insight_summary;
  return (
    <div
      className={`flex min-w-0 w-full flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 dark:bg-[#0b1220]/80 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] dark:ring-white/10 lg:flex lg:min-h-0 lg:max-h-[calc(100dvh-11rem)] lg:overflow-hidden ${className}`}
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

      <div className="@container grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-x-hidden isolate @[960px]:grid-cols-[minmax(0,1fr)_280px]">
        <div className="chat-messages-scroll relative z-0 min-w-0 overflow-x-hidden [overflow-anchor:auto] @[960px]:min-h-0 @[960px]:overflow-y-auto @[960px]:overscroll-contain">
          <ReviewWorkspaceHero
            university={reviewUniversityDetail}
            eyebrow={content.bannerEyebrow}
            shortName={shortName}
            location={reviewUniversityDetail?.location}
            summary={reviewUniversityDetail?.summary}
            averageRating={averageRating}
            reviewCount={reviewCount}
            metaHeader={metaHeader}
            memberCount={memberCount}
            aspectAverages={aspectAverages}
            distribution={distribution}
            statLabels={content.statLabels}
            ratingFilter={ratingFilter}
            onRatingFilterChange={setRatingFilter}
            reviews={reviews}
          />

          <div className="space-y-5 px-5 pb-28 pt-4 sm:px-6 sm:pb-6 lg:pb-6">
            {content.canWriteReview && content.formTitle && (
              <ReviewComposeForm
                title={content.formTitle}
                subtitle={
                  content.formSubtitle ||
                  (shortName ? `${shortName} haqida sharh qoldiring` : "Tajribangizni ulashing")
                }
                placeholder={content.formPlaceholder}
                overallLabel={content.formOverallLabel}
                aspectHint={content.formAspectHint}
                footerNote={content.formFooterNote}
                rating={rating}
                onRatingChange={onRatingChange}
                aspectRatings={aspectRatings}
                onAspectChange={onAspectChange}
                studyDirections={reviewUniversityDetail?.study_directions ?? []}
                studyDirectionId={studyDirectionId}
                onStudyDirectionChange={onStudyDirectionChange}
                reviewText={reviewText}
                onReviewTextChange={onReviewTextChange}
                isSubmitting={isReviewSubmitting}
                onSubmit={onSubmitReview}
              />
            )}

            <ReviewUniversityProfile insightSummary={insightSummary} reviewCount={reviewCount} />

            {content.notice && (
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/90 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-950/30">
                <p className="text-sm font-medium leading-relaxed text-amber-900 dark:text-amber-100">
                  {content.notice}
                </p>
              </div>
            )}

            <section id="review-feed-section" className="scroll-mt-4 border-t border-slate-100 pt-8 dark:border-white/10">
              <ReviewSectionHeader
                eyebrow={content.reviewsHeading}
                title={shortName ? `${shortName} sharhlari` : content.reviewsSubheading}
                description={reviews.length > 0 ? feedSummary : content.emptyHint}
                action={
                  reviews.length > 0 ? (
                    <span className="inline-flex w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black tabular-nums text-slate-700 dark:bg-white/10 dark:text-slate-200">
                      {filteredAndSortedReviews.length}
                      {filteredAndSortedReviews.length !== reviews.length ? ` / ${reviews.length}` : ""} ta
                    </span>
                  ) : null
                }
              />

              {reviews.length > 0 && (
                <div className="mb-5 mt-5 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/60 dark:bg-white/[0.03] dark:ring-white/10 sm:p-4">
                  <ReviewFeedControls
                    layout="stack"
                    sortOptions={sortOptions}
                    sortId={sortId}
                    onSortChange={setSortId}
                    ratingFilter={ratingFilter}
                    onRatingFilterChange={setRatingFilter}
                  />
                </div>
              )}

              <div className="space-y-3">
              {reviews.length === 0 ? (
                <EmptyState
                  variant="reviews"
                  title={content.emptyTitle}
                  description={content.emptyHint}
                  action={
                    isStudent
                      ? {
                          label: "Birinchi sharhingizni yozing",
                          onClick: () =>
                            scrollElementIntoView(document.getElementById("review-compose-form"), {
                              block: "start",
                            }),
                        }
                      : onOpenChat
                        ? {
                            label: "Chatda savol berish",
                            onClick: onOpenChat,
                          }
                        : undefined
                  }
                  secondaryAction={
                    {
                      label: "Taqqoslash",
                      onClick: () => changeSection("compare"),
                    }
                  }
                />
              ) : (
                <>
                  {renderedReviews.length === 0 ? (
                    <EmptyState
                      compact
                      variant="filter"
                      title="Bu bahoda sharh topilmadi"
                      description="Boshqa filtr yoki saralashni sinab ko'ring."
                      action={{
                        label: "Filtrni tozalash",
                        onClick: () => {
                          setRatingFilter("all");
                          setSortId(content.defaultSort);
                        },
                      }}
                    />
                  ) : (
                    <ul className="space-y-4">
                      {renderedReviews.map(({ item, featured }) => (
                        <li key={item.id}>
                          <ReviewCard
                            item={item}
                            onLike={onLike}
                            onDelete={isStudent ? requestDeleteReview : undefined}
                            onReport={openReviewReport}
                            featured={featured}
                            featuredLabel={content.featuredLabel}
                            elevated={!featured}
                            likeLabel={content.likeButtonLabel}
                            showMineBadge={isStudent}
                            showStudentVoiceBadge={!isStudent}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              </div>
            </section>
          </div>
        </div>

        <OverviewSidebar
          content={content}
          reviewUniversityDetail={reviewUniversityDetail}
          reviewCount={reviewCount}
          averageRating={averageRating}
          totalLikes={totalLikes}
          memberCount={memberCount}
          isStudent={isStudent}
        />
      </div>
    </div>
  );
}
