import UniversityAvatar from "@/components/UniversityAvatar.jsx";

export default function CompareQuickPicks({ pairs, onApply, label }) {
  if (!pairs.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white p-3 shadow-sm dark:border-white/10 dark:from-white/[0.05] dark:to-white/[0.02] sm:p-4">
      <div className="flex items-center justify-center gap-2">
        <span className="h-px w-6 bg-slate-200 dark:bg-white/15" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <span className="h-px w-6 bg-slate-200 dark:bg-white/15" aria-hidden="true" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {pairs.map(({ ids, universities }, pickIndex) => {
          const count = universities.length;

          return (
            <button
              key={ids.join("-")}
              type="button"
              onClick={() => onApply(ids)}
              className="group relative flex min-h-[4.75rem] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-3 py-3 text-center shadow-soft transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/40"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden="true"
              />

              <span className="flex items-center justify-center -space-x-2.5">
                {universities.map((university, index) => (
                  <span
                    key={university.id}
                    className="relative rounded-full shadow-sm ring-2 ring-white transition group-hover:ring-primary/20 dark:ring-[#0b1220]"
                    style={{ zIndex: universities.length - index }}
                  >
                    <UniversityAvatar university={university} size="xs" />
                  </span>
                ))}
              </span>

              <span className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-x-1 gap-y-0.5 px-0.5">
                {universities.map((university, index) => (
                  <span key={university.id} className="inline-flex min-w-0 items-center gap-1">
                    {index > 0 && (
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-300 dark:text-slate-600">
                        vs
                      </span>
                    )}
                    <span className="truncate text-[12px] font-black leading-tight text-slate-800 dark:text-slate-100">
                      {university.short_name || university.name}
                    </span>
                  </span>
                ))}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-500 transition group-hover:bg-primary/10 group-hover:text-primary dark:bg-white/10 dark:text-slate-400">
                {count} OTM
                <span
                  className="translate-x-0 text-primary opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>

              <span className="sr-only">
                Kombinatsiya {pickIndex + 1}:{" "}
                {universities.map((u) => u.short_name || u.name).join(" vs ")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
