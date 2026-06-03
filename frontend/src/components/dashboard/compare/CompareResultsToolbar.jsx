const TABS = [
  { id: "overview", label: "Umumiy" },
  { id: "matrix", label: "Jadval" },
  { id: "details", label: "Batafsil" },
];

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function CompareResultsToolbar({
  activeTab,
  onTabChange,
  onShareLink,
  copyState,
  shareExpiry,
}) {
  const shareLabel =
    copyState === "creating"
      ? "Havola yaratilmoqda..."
      : copyState === "copied"
        ? "Nusxa olindi ✓"
        : copyState === "error"
          ? "Xatolik — qayta urinib ko'ring"
          : "Havola yaratish";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/70 dark:bg-white/[0.06] dark:ring-white/10"
        role="tablist"
        aria-label="Taqqoslash ko'rinishi"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-black transition ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-blue-200"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <button
          type="button"
          onClick={onShareLink}
          disabled={copyState === "creating"}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 text-xs font-black text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.55)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.65)] active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <LinkIcon />
          {shareLabel}
        </button>
        {copyState === "copied" && shareExpiry ? (
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            2 kun amal qiladi · {shareExpiry} gacha
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Do&apos;stlaringizga ko&apos;rish uchun alohida sahifa
          </p>
        )}
      </div>
    </div>
  );
}
