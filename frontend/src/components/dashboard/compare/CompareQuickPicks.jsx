import UniversityAvatar from "../../UniversityAvatar.jsx";

export default function CompareQuickPicks({ pairs, onApply, label }) {
  if (!pairs.length) {
    return null;
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {pairs.map(({ ids, universities }) => (
          <button
            key={ids.join("-")}
            type="button"
            onClick={() => onApply(ids)}
            className="group flex min-w-0 items-center gap-2 rounded-xl bg-gradient-to-r from-slate-50 to-white px-3 py-2.5 text-left text-xs font-bold text-slate-700 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40 dark:from-white/[0.04] dark:to-white/[0.02] dark:text-slate-200 dark:ring-white/10"
          >
            <span className="flex -space-x-2">
              {universities.map((university) => (
                <span key={university.id} className="ring-2 ring-white dark:ring-[#0b1220]">
                  <UniversityAvatar university={university} size="xs" />
                </span>
              ))}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {universities.map((university, index) => (
                <span key={university.id}>
                  {index > 0 && <span className="mx-0.5 font-black text-slate-300">vs</span>}
                  {university.short_name}
                </span>
              ))}
            </span>
            <span className="shrink-0 text-primary opacity-0 transition group-hover:opacity-100" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
