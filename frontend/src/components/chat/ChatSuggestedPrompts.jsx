/**
 * Unibuddy-style suggested questions — tap fills the composer (does not auto-send).
 */
export default function ChatSuggestedPrompts({
  title = "Savol tanlang — suhbatni boshlang",
  prompts = [],
  onSelect,
  className = "",
}) {
  if (!prompts.length || typeof onSelect !== "function") {
    return null;
  }

  return (
    <div
      className={`mx-auto flex w-full max-w-md flex-col items-center justify-center px-2 py-6 text-center ${className}`.trim()}
      data-testid="chat-suggested-prompts"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
        Tezkor savollar
      </p>
      <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Birini bosing — matn yozish maydoniga tushadi, keyin yuboring.
      </p>
      <ul className="mt-5 flex w-full flex-col gap-2">
        {prompts.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onSelect(prompt)}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-left text-sm font-bold text-slate-800 shadow-sm transition hover:border-primary/35 hover:bg-blue-50/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-primary/40 dark:hover:bg-primary/10"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
