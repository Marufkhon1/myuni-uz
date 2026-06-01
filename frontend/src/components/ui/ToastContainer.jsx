import { createPortal } from "react-dom";

const toneStyles = {
  success:
    "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-950/90 dark:text-emerald-100",
  error:
    "border-red-200/80 bg-red-50 text-red-800 dark:border-red-400/25 dark:bg-red-950/90 dark:text-red-100",
  warning:
    "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/90 dark:text-amber-100",
  info: "border-slate-200/80 bg-white text-slate-800 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100",
};

function ToastIcon({ tone }) {
  if (tone === "success") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "error") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "warning") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M12 8v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 16v-4m0-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (typeof document === "undefined" || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur-xl animate-[toast-in_0.28s_ease-out] ${toneStyles[toast.tone] ?? toneStyles.info}`}
        >
          <ToastIcon tone={toast.tone} />
          <p className="min-w-0 flex-1 text-sm font-semibold leading-6">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 rounded-lg p-1 text-current opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
            aria-label="Yopish"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
