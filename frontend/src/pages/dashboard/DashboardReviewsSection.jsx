import ReviewUniversityList from "../../components/dashboard/ReviewUniversityList.jsx";
import ReviewWorkspacePanel from "../../components/dashboard/ReviewWorkspacePanel.jsx";

export default function DashboardReviewsSection({
  isStudent,
  isPhone,
  isWideReview = false,
  reviewUniversity,
  reviewUniversitySearch,
  onReviewUniversitySearchChange,
  filteredReviewUniversities,
  onSelectReviewUniversity,
  mobileReviewScreen,
  reviewUniversityDetail,
  isReviewDetailLoading,
  reviews,
  onBackToReviewList,
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
  onDeleteReview,
  onReportReview,
  onOpenSection,
  onOpenChat,
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px]">
      <section
        className={`grid items-start gap-4 md:gap-5 ${
          isWideReview
            ? "lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch lg:gap-6"
            : "grid-cols-1"
        }`}
      >
        <ReviewUniversityList
          isStudent={isStudent}
          search={reviewUniversitySearch}
          onSearchChange={onReviewUniversitySearchChange}
          universities={filteredReviewUniversities}
          selectedId={reviewUniversity}
          onSelect={onSelectReviewUniversity}
          className={isPhone && mobileReviewScreen !== "list" ? "hidden" : ""}
          isWideLayout={isWideReview}
        />

        <ReviewWorkspacePanel
          key={`${reviewUniversity}-${isStudent ? "student" : "applicant"}`}
          isStudent={isStudent}
          isPhone={isPhone}
          reviewUniversity={reviewUniversity}
          reviewUniversityDetail={reviewUniversityDetail}
          isReviewDetailLoading={isReviewDetailLoading}
          reviews={reviews}
          onBack={onBackToReviewList}
          onSubmitReview={onSubmitReview}
          rating={rating}
          onRatingChange={onRatingChange}
          aspectRatings={aspectRatings}
          onAspectChange={onAspectChange}
          studyDirectionId={studyDirectionId}
          onStudyDirectionChange={onStudyDirectionChange}
          reviewText={reviewText}
          onReviewTextChange={onReviewTextChange}
          isReviewSubmitting={isReviewSubmitting}
          onLike={onLike}
          onDeleteReview={onDeleteReview}
          onReportReview={onReportReview}
          onOpenSection={onOpenSection}
          onOpenChat={onOpenChat}
          className={`min-w-0 w-full ${isPhone && mobileReviewScreen !== "detail" ? "hidden" : ""}`}
        />
      </section>
    </div>
  );
}
