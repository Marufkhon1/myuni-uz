import { useCallback, useState } from "react";
import { reportDirectMessage, reportUniversityMessage } from "@/services/chatService.js";
import { reportReview } from "@/services/universityService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";

export function useDashboardDialogs({
  toast,
  reportChatError,
  clearChatError,
  deleteGroupMessageById,
  deletePrivateMessageById,
  handleDeleteReview,
  setPopularReviews,
}) {
  const [reportTarget, setReportTarget] = useState(null);
  const [reviewReportTarget, setReviewReportTarget] = useState(null);
  const [isReviewReportSubmitting, setIsReviewReportSubmitting] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [messageDeleteTarget, setMessageDeleteTarget] = useState(null);
  const [isMessageDeleting, setIsMessageDeleting] = useState(false);
  const [reviewDeleteTarget, setReviewDeleteTarget] = useState(null);
  const [isReviewDeleting, setIsReviewDeleting] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const openMessageReport = useCallback((message, scope) => {
    setReportTarget({ message, scope });
  }, []);

  const requestDeleteGroupMessage = useCallback((message) => {
    setMessageDeleteTarget({ message, scope: "group" });
  }, []);

  const requestDeletePrivateMessage = useCallback((message) => {
    setMessageDeleteTarget({ message, scope: "private" });
  }, []);

  const requestDeleteReview = useCallback((reviewId) => {
    setReviewDeleteTarget(reviewId);
  }, []);

  const openReviewReport = useCallback((review) => {
    setReviewReportTarget(review);
  }, []);

  const submitMessageReport = useCallback(
    async (payload) => {
      if (!reportTarget) {
        return;
      }
      setIsReportSubmitting(true);
      try {
        if (reportTarget.scope === "group") {
          await reportUniversityMessage(reportTarget.message.id, payload);
        } else {
          await reportDirectMessage(reportTarget.message.id, payload);
        }
        setReportTarget(null);
        clearChatError();
        toast.success("Shikoyat yuborildi. Moderatorlar ko'rib chiqadi.");
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Shikoyat yuborilmadi."));
      } finally {
        setIsReportSubmitting(false);
      }
    },
    [reportTarget, clearChatError, toast, reportChatError]
  );

  const submitReviewReport = useCallback(
    async (payload) => {
      if (!reviewReportTarget) {
        return;
      }
      setIsReviewReportSubmitting(true);
      try {
        await reportReview(reviewReportTarget.id, payload);
        toast.success("Shikoyat qabul qilindi. Moderatorlar ko'rib chiqadi.");
        setReviewReportTarget(null);
      } catch (requestError) {
        toast.error(getApiErrorMessage(requestError, "Shikoyat yuborilmadi."));
      } finally {
        setIsReviewReportSubmitting(false);
      }
    },
    [reviewReportTarget, toast]
  );

  const confirmMessageDelete = useCallback(async () => {
    if (!messageDeleteTarget) {
      return;
    }

    const { message, scope } = messageDeleteTarget;
    setIsMessageDeleting(true);
    try {
      if (scope === "group") {
        await deleteGroupMessageById(message.id);
      } else {
        await deletePrivateMessageById(message.id);
      }
      setMessageDeleteTarget(null);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Xabarni o'chirib bo'lmadi."));
    } finally {
      setIsMessageDeleting(false);
    }
  }, [messageDeleteTarget, deleteGroupMessageById, deletePrivateMessageById, clearChatError, reportChatError]);

  const confirmReviewDelete = useCallback(async () => {
    if (!reviewDeleteTarget) {
      return;
    }

    setIsReviewDeleting(true);
    try {
      await handleDeleteReview(reviewDeleteTarget);
      setPopularReviews((current) => current.filter((item) => item.id !== reviewDeleteTarget));
      setReviewDeleteTarget(null);
      toast.success("Sharh o'chirildi.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Sharhni o'chirib bo'lmadi. Qayta urinib ko'ring."));
    } finally {
      setIsReviewDeleting(false);
    }
  }, [reviewDeleteTarget, handleDeleteReview, setPopularReviews, toast]);

  return {
    onboardingOpen,
    setOnboardingOpen,
    openMessageReport,
    requestDeleteGroupMessage,
    requestDeletePrivateMessage,
    requestDeleteReview,
    openReviewReport,
    dialogProps: {
      reportTarget,
      onCloseReport: () => setReportTarget(null),
      onSubmitMessageReport: submitMessageReport,
      isReportSubmitting,
      reviewReportTarget,
      onCloseReviewReport: () => setReviewReportTarget(null),
      onSubmitReviewReport: submitReviewReport,
      isReviewReportSubmitting,
      reviewDeleteTarget,
      onCloseReviewDelete: () => {
        if (!isReviewDeleting) {
          setReviewDeleteTarget(null);
        }
      },
      onConfirmReviewDelete: confirmReviewDelete,
      isReviewDeleting,
      messageDeleteTarget,
      onCloseMessageDelete: () => {
        if (!isMessageDeleting) {
          setMessageDeleteTarget(null);
        }
      },
      onConfirmMessageDelete: confirmMessageDelete,
      isMessageDeleting,
      onboardingOpen,
      onCloseOnboarding: () => setOnboardingOpen(false),
    },
  };
}
