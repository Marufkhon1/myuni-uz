import { useCallback } from "react";
import { markApplicantChecklistStep } from "@/utils/applicantChecklist.js";

export function useDashboardReviewNav({
  changeSection,
  bumpChecklistVersion,
  selectReviewUniversity,
  reviewUniversity,
  setSelectedUniversityId,
  setChatPanel,
  setMobileChatScreen,
  syncChatUniversityInUrl,
  prepareGroupChatSwitch,
}) {
  const openReviewUniversityFromPopular = useCallback(
    (universityId) => {
      markApplicantChecklistStep("reviews");
      bumpChecklistVersion();
      changeSection("reviews");
      selectReviewUniversity(universityId);
    },
    [changeSection, bumpChecklistVersion, selectReviewUniversity]
  );

  const openChatFromReviewUniversity = useCallback(() => {
    if (!reviewUniversity) {
      return;
    }
    const id = Number(reviewUniversity);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    setSelectedUniversityId(id);
    setChatPanel("group");
    setMobileChatScreen("chat");
    prepareGroupChatSwitch?.(id);
    changeSection("chats");
    syncChatUniversityInUrl(id);
  }, [
    reviewUniversity,
    setSelectedUniversityId,
    setChatPanel,
    setMobileChatScreen,
    changeSection,
    syncChatUniversityInUrl,
    prepareGroupChatSwitch,
  ]);

  return {
    openReviewUniversityFromPopular,
    openChatFromReviewUniversity,
  };
}
