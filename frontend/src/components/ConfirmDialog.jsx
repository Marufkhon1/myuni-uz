import ModalOverlay from "./ui/ModalOverlay.jsx";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  onConfirm,
  onClose,
  isSubmitting = false,
  tone = "danger",
}) {
  if (!open) {
    return null;
  }

  const confirmClassName =
    tone === "danger"
      ? "btn-modal-danger"
      : "btn-modal-primary";

  return (
    <ModalOverlay onClose={onClose} labelledBy="confirm-dialog-title" panelClassName="mx-auto w-full max-w-md max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-900">
      <h2 id="confirm-dialog-title" className="text-lg font-black text-slate-950 dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="btn-modal-secondary"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={confirmClassName}
        >
          {isSubmitting ? "Kutilmoqda..." : confirmLabel}
        </button>
      </div>
    </ModalOverlay>
  );
}
