import { useMemo } from "react";

export function useDashboardContextValue({
  role,
  isStudent,
  activeSection,
  changeSection,
  openUniversityChat,
  openUniversityReviews,
  openReviewUniversityFromPopular,
  selectReviewUniversity,
  openMessageReport,
  requestDeleteReview,
  openReviewReport,
  requestDeleteGroupMessage,
  requestDeletePrivateMessage,
}) {
  return useMemo(
    () => ({
      role,
      isStudent,
      activeSection,
      changeSection,
      openUniversityChat,
      openUniversityReviews,
      openReviewUniversityFromPopular,
      selectReviewUniversity,
      openMessageReport,
      requestDeleteReview,
      openReviewReport,
      requestDeleteGroupMessage,
      requestDeletePrivateMessage,
    }),
    [
      role,
      isStudent,
      activeSection,
      changeSection,
      openUniversityChat,
      openUniversityReviews,
      openReviewUniversityFromPopular,
      selectReviewUniversity,
      openMessageReport,
      requestDeleteReview,
      openReviewReport,
      requestDeleteGroupMessage,
      requestDeletePrivateMessage,
    ]
  );
}
