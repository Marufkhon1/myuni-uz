import ReviewUniversityList from "../../components/dashboard/ReviewUniversityList.jsx";
import ReviewWorkspacePanel from "../../components/dashboard/ReviewWorkspacePanel.jsx";

export default function DashboardReviewsSection({
  isStudent,
  isPhone,
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
  reviewText,
  onReviewTextChange,
  isReviewSubmitting,
  reviewSubmitError,
  onLike,
  onDeleteReview,
  stars,
  onOpenSection,
  onOpenChat,
}) {
  return (
    <section
      className={`grid items-start gap-4 md:gap-6 ${
        isPhone
          ? "grid-cols-1"
          : "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,420px)_1fr]"
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
        reviewText={reviewText}
        onReviewTextChange={onReviewTextChange}
        isReviewSubmitting={isReviewSubmitting}
        reviewSubmitError={reviewSubmitError}
        onLike={onLike}
      onDeleteReview={onDeleteReview}
      stars={stars}
        onOpenSection={onOpenSection}
        onOpenChat={onOpenChat}
        className={isPhone && mobileReviewScreen !== "detail" ? "hidden" : ""}
      />
    </section>
  );
}
