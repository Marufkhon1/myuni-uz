function previewHeadline(text) {
  const line = String(text || "")
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  return line || "";
}

export default function ChatComposeEditBar({ preview, onCancel }) {
  const headline = previewHeadline(preview);

  return (
    <div className="mb-2 flex items-start gap-2.5 border-b border-slate-200/90 pb-2.5 dark:border-white/10">
      <div className="mt-1 h-9 w-0.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-9.5 9.5a1 1 0 0 1-.39.242l-3.5 1.167a.5.5 0 0 1-.632-.632l1.167-3.5a1 1 0 0 1 .242-.39l9.5-9.5Z"
            />
          </svg>
          Xabarni tahrirlash
        </p>
        {headline ? (
          <p
            className="mt-1 line-clamp-2 break-words [overflow-wrap:anywhere] whitespace-pre-wrap text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 dark:text-slate-400 dark:decoration-slate-600"
            title={preview}
          >
            {headline}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Tahrirlashni bekor qilish"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M5.293 5.293a1 1 0 0 1 1.414 0L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414L11.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L8.586 10 5.293 6.707a1 1 0 0 1 0-1.414Z"
          />
        </svg>
      </button>
    </div>
  );
}
