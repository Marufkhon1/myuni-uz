import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import MessageReportDialog from "@/components/MessageReportDialog.jsx";
import ReviewReportDialog from "@/components/reviews/ReviewReportDialog.jsx";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard.jsx";

export default function DashboardDialogs({
  reportTarget,
  onCloseReport,
  onSubmitMessageReport,
  isReportSubmitting,
  reviewReportTarget,
  onCloseReviewReport,
  onSubmitReviewReport,
  isReviewReportSubmitting,
  reviewDeleteTarget,
  onCloseReviewDelete,
  onConfirmReviewDelete,
  isReviewDeleting,
  messageDeleteTarget,
  onCloseMessageDelete,
  onConfirmMessageDelete,
  isMessageDeleting,
  onboardingOpen,
  onCloseOnboarding,
  profile,
  displayName,
  universities,
  isStudent,
  joinedChatCount,
  onRefreshUser,
  onJoinChat,
  onGoToChats,
}) {
  return (
    <>
      <MessageReportDialog
        open={Boolean(reportTarget)}
        onClose={onCloseReport}
        onSubmit={onSubmitMessageReport}
        isSubmitting={isReportSubmitting}
      />

      <ReviewReportDialog
        open={Boolean(reviewReportTarget)}
        onClose={onCloseReviewReport}
        onSubmit={onSubmitReviewReport}
        isSubmitting={isReviewReportSubmitting}
      />

      <ConfirmDialog
        open={Boolean(reviewDeleteTarget)}
        title="Sharhni o'chirish"
        description="Bu sharhni butunlay o'chirmoqchimisiz? Amalni ortga qaytarib bo'lmaydi."
        confirmLabel="Ha"
        cancelLabel="Yo'q"
        onClose={onCloseReviewDelete}
        onConfirm={onConfirmReviewDelete}
        isSubmitting={isReviewDeleting}
        tone="danger"
      />

      <ConfirmDialog
        open={Boolean(messageDeleteTarget)}
        title="Xabarni o'chirish"
        description="Bu xabarni butunlay o'chirmoqchimisiz? Amalni ortga qaytarib bo'lmaydi."
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        onClose={onCloseMessageDelete}
        onConfirm={onConfirmMessageDelete}
        isSubmitting={isMessageDeleting}
        tone="danger"
      />

      <OnboardingWizard
        open={onboardingOpen}
        onClose={onCloseOnboarding}
        profile={profile}
        displayName={displayName}
        universities={universities}
        isStudent={isStudent}
        joinedChatCount={joinedChatCount}
        onRefreshUser={onRefreshUser}
        onJoinChat={onJoinChat}
        onGoToChats={onGoToChats}
      />
    </>
  );
}
