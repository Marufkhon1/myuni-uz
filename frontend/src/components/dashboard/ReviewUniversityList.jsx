import UniversityAvatar from "../UniversityAvatar.jsx";

const searchInputClass =
  "mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25";

export default function ReviewUniversityList({
  title,
  subtitle,
  hint,
  search,
  onSearchChange,
  universities,
  selectedId,
  onSelect,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-[min(520px,calc(100dvh-11rem))] max-h-[calc(100dvh-11rem)] flex-col rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] md:max-h-[calc(100vh-10rem)] ${className}`}
    >
      <div className="shrink-0 border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{title}</p>
        <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 dark:text-white">{subtitle}</h2>
        {hint && <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{hint}</p>}
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Universitet qidiring..."
          className={searchInputClass}
        />
        <p className="mt-2 text-[11px] font-semibold text-slate-400">
          {universities.length} ta universitet
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
        {universities.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500 dark:bg-white/5">
            Universitet topilmadi.
          </p>
        ) : (
          <ul className="space-y-2">
            {universities.map((university) => {
              const isSelected = String(selectedId) === String(university.id);
              return (
                <li key={university.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(university.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-primary/40 bg-blue-50 shadow-sm ring-1 ring-primary/20 dark:border-primary/40 dark:bg-blue-400/10"
                        : "border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-white/[0.04] dark:hover:border-white/15"
                    }`}
                  >
                    <UniversityAvatar university={university} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                        {university.short_name || university.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {university.location}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-black text-white">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
