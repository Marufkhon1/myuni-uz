import { formatAdmissionDate } from "@/utils/universityCatalog.js";

export default function UniversityPublicAdmission({ cycles = [] }) {
  if (!cycles.length) {
    return null;
  }

  return (
    <section className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6" id="admission">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Qabul ma&apos;lumotlari</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Kvota, minimal ball va muddatlar — rasmiy e&apos;lonlar asosida yangilanadi.
      </p>
      <div className="mt-5 space-y-5">
        {cycles.map((cycle) => (
          <article
            key={cycle.id}
            className="overflow-hidden rounded-[1.25rem] border border-slate-200/80 shadow-sm dark:border-white/10"
          >
            <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-4 py-4 dark:border-white/10 dark:from-white/[0.05] dark:to-white/[0.02] sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  {cycle.academic_year} o&apos;quv yili
                </h3>
                {cycle.published_at && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Yangilangan: {formatAdmissionDate(cycle.published_at)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
                  Ariza: {formatAdmissionDate(cycle.application_deadline)}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
                  Imtihon: {formatAdmissionDate(cycle.exam_date)}
                </span>
              </div>
              {cycle.notes && (
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{cycle.notes}</p>
              )}
            </div>
            {cycle.quotas?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-transparent">
                      <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                        Yo&apos;nalish
                      </th>
                      <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                        Grant
                      </th>
                      <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                        Kontrakt
                      </th>
                      <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                        Min. ball
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycle.quotas.map((quota) => (
                      <tr
                        key={quota.id}
                        className="border-b border-slate-100 last:border-0 dark:border-white/5"
                      >
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                          {quota.direction?.name || "Umumiy"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                          {quota.grant_quota ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                          {quota.contract_quota ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-black text-primary">{quota.min_score ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
