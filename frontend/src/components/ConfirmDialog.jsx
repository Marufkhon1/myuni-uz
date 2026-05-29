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
      ? "rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
      : "rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-black text-slate-950 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 disabled:opacity-50 dark:border-white/15 dark:text-slate-300"
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
      </div>
    </div>
  );
}
