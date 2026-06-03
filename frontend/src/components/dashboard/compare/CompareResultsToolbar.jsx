const TABS = [
  { id: "overview", label: "Umumiy" },
  { id: "matrix", label: "Jadval" },
  { id: "details", label: "Batafsil" },
];

export default function CompareResultsToolbar({
  activeTab,
  onTabChange,
  differencesOnly,
  onDifferencesOnlyChange,
  onCopyLink,
  copyState,
  showDifferencesToggle = true,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-blue-200"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showDifferencesToggle && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10">
            <input
              type="checkbox"
              checked={differencesOnly}
              onChange={(event) => onDifferencesOnlyChange(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            Faqat farqlar
          </label>
        )}
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200/80 transition hover:ring-primary dark:bg-white/[0.04] dark:text-slate-200 dark:ring-white/10"
        >
          {copyState === "copied" ? "Nusxa olindi ✓" : copyState === "error" ? "Xatolik" : "Havolani nusxalash"}
        </button>
      </div>
    </div>
  );
}
