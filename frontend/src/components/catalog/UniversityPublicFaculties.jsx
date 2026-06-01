export default function UniversityPublicFaculties({ faculties = [] }) {
  if (!faculties.length) {
    return null;
  }

  return (
    <section className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Yo&apos;nalishlar / fakultetlar</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Rasmiy fakultet va ta&apos;lim yo&apos;nalishlari — abituriyentlar uchun tanlov qo&apos;llanmasi.
      </p>
      <div className="mt-4 space-y-4">
        {faculties.map((faculty) => (
          <article
            key={faculty.id}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <h3 className="text-base font-black text-slate-950 dark:text-white">{faculty.name}</h3>
            {faculty.description && (
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{faculty.description}</p>
            )}
            {faculty.directions?.length > 0 && (
              <ul className="mt-3 space-y-2">
                {faculty.directions.map((direction) => (
                  <li
                    key={direction.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{direction.name}</span>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      {direction.degree_level_label}
                      {direction.duration_years ? ` · ${direction.duration_years} yil` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
