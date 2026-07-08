import { useMemo, useState } from "react";
import {
  DEGREE_TABS,
  filterDirections,
  groupFacultiesByDegree,
  summarizeDirections,
} from "@/utils/universityPublic.js";

function DirectionMeta({ direction }) {
  const parts = [];
  if (direction.dirid) {
    parts.push(`Shifr: ${direction.dirid}`);
  }
  if (direction.study_forms?.length) {
    parts.push(direction.study_forms.join(", "));
  }
  if (direction.exam_subjects?.length) {
    parts.push(`Fanlar: ${direction.exam_subjects.join(" · ")}`);
  }
  if (!parts.length) {
    return null;
  }
  return (
    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{parts.join(" · ")}</p>
  );
}

export default function UniversityPublicFaculties({ faculties = [] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => summarizeDirections(faculties), [faculties]);

  const visibleFaculties = useMemo(() => {
    const grouped = groupFacultiesByDegree(faculties, activeTab);
    return filterDirections(grouped, query);
  }, [faculties, activeTab, query]);

  if (!faculties.length || counts.total === 0) {
    return null;
  }

  const tabs = DEGREE_TABS.filter((tab) => {
    if (tab.id === "all") {
      return counts.total > 0;
    }
    return (counts[tab.id] || 0) > 0;
  });

  return (
    <section className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6" id="programs">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-primary">Ta&apos;lim yo&apos;nalishlari</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Rasmiy bakalavriat, magistratura va doktorantura dasturlari
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {counts.total} ta yo&apos;nalish
        </span>
      </div>

      {tabs.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const count = tab.id === "all" ? counts.total : counts[tab.id] || 0;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  active
                    ? "bg-primary text-white shadow-glow"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {counts.total > 8 && (
        <label className="mt-4 block">
          <span className="sr-only">Yo&apos;nalish qidirish</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Yo'nalish nomi yoki shifr bo'yicha qidirish..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none ring-primary/20 placeholder:text-slate-400 focus:border-primary focus:ring-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
          />
        </label>
      )}

      <div className="mt-5 space-y-4">
        {visibleFaculties.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            Qidiruv bo&apos;yicha yo&apos;nalish topilmadi.
          </p>
        ) : (
          visibleFaculties.map((faculty) => (
            <article
              key={faculty.id}
              className="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="border-b border-slate-200/70 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04] sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-black text-slate-950 dark:text-white">{faculty.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {faculty.directions.length} ta
                  </span>
                </div>
                {faculty.description && (
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{faculty.description}</p>
                )}
              </div>

              <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                {faculty.directions.map((direction) => (
                  <li key={direction.id} className="px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-6 text-slate-800 dark:text-slate-100">
                          {direction.name}
                        </p>
                        <DirectionMeta direction={direction} />
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary dark:bg-primary/20">
                        {direction.degree_level_label}
                        {direction.duration_years ? ` · ${direction.duration_years} yil` : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
