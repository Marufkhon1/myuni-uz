import ModalOverlay from "./ui/ModalOverlay.jsx";

const TONE_STYLES = {
  danger: {
    header:
      "border-slate-100 bg-gradient-to-br from-rose-50/95 via-white to-red-50/50 dark:border-white/10 dark:from-rose-500/12 dark:via-[#0b1220] dark:to-red-500/8",
    glow: "bg-rose-400/20 dark:bg-rose-500/12",
    iconShell:
      "bg-gradient-to-br from-rose-500/15 to-red-500/10 text-rose-600 ring-rose-200/70 dark:from-rose-400/15 dark:to-red-400/10 dark:text-rose-300 dark:ring-rose-400/25",
    confirm:
      "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-rose-500 dark:shadow-red-900/40",
  },
  primary: {
    header:
      "border-slate-100 bg-gradient-to-br from-blue-50/95 via-white to-violet-50/40 dark:border-white/10 dark:from-blue-500/12 dark:via-[#0b1220] dark:to-violet-500/8",
    glow: "bg-blue-400/20 dark:bg-blue-500/12",
    iconShell:
      "bg-gradient-to-br from-primary/15 to-blue-500/10 text-primary ring-blue-200/70 dark:from-blue-400/15 dark:to-violet-400/10 dark:text-blue-300 dark:ring-blue-400/25",
    confirm:
      "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25 hover:from-blue-600 hover:to-blue-500 dark:shadow-blue-900/40",
  },
};

function TrashIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6" />
    </svg>
  );
}

function InfoIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

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
  icon,
}) {
  if (!open) {
    return null;
  }

  const theme = TONE_STYLES[tone] || TONE_STYLES.danger;
  const iconNode =
    icon ??
    (tone === "danger" ? (
      <TrashIcon />
    ) : (
      <InfoIcon />
    ));

  return (
    <ModalOverlay onClose={onClose} labelledBy="confirm-dialog-title">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#0b1220] dark:shadow-[0_28px_80px_-20px_rgba(0,0,0,0.75)]">
        <div className={`relative overflow-hidden border-b px-6 py-5 ${theme.header}`}>
          <div
            className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${theme.glow}`}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/80 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Yopish"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative flex items-start gap-3.5 pr-8">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 ${theme.iconShell}`}
              aria-hidden="true"
            >
              {iconNode}
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-black tracking-tight text-slate-950 dark:text-white"
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-6 pt-5">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/[0.07]"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.confirm}`}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                  Kutilmoqda...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
