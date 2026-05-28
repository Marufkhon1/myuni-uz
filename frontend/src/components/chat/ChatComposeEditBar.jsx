export default function ChatComposeEditBar({ preview, onCancel }) {
  return (
    <div className="mb-3 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-3 py-2.5 dark:border-primary/30 dark:bg-primary/10">
      <div
        className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-primary"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black uppercase tracking-wide text-primary">Tahrirlash</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">
          {preview}
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 rounded-xl px-2 py-1 text-sm font-black text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Tahrirlashni bekor qilish"
      >
        ✕
      </button>
    </div>
  );
}
