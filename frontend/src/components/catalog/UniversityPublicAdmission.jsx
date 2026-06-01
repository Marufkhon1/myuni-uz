import { formatAdmissionDate } from "../../utils/universityCatalog.js";

export default function UniversityPublicAdmission({ cycles = [] }) {
  if (!cycles.length) {
    return null;
  }

  return (
    <section className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Qabul ma&apos;lumotlari</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Kvota, minimal ball va muddatlar — mavsumiy yangilanadi (rasmiy e&apos;lonlar asosida).
      </p>
      <div className="mt-4 space-y-5">
        {cycles.map((cycle) => (
          <article
            key={cycle.id}
            className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10"
          >
            <div className="border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04] sm:px-5">
              <h3 className="text-base font-black text-slate-950 dark:text-white">
                O&apos;qish yili: {cycle.academic_year}
              </h3>
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Ariza muddati: {formatAdmissionDate(cycle.application_deadline)}</span>
                <span>Imtihon: {formatAdmissionDate(cycle.exam_date)}</span>
              </div>
              {cycle.notes && (
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{cycle.notes}</p>
              )}
            </div>
            {cycle.quotas?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-white dark:bg-transparent">
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="px-4 py-3 font-black text-slate-500">Yo&apos;nalish</th>
                      <th className="px-4 py-3 font-black text-slate-500">Grant</th>
                      <th className="px-4 py-3 font-black text-slate-500">Kontrakt</th>
                      <th className="px-4 py-3 font-black text-slate-500">Min. ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycle.quotas.map((quota) => (
                      <tr key={quota.id} className="border-b border-slate-100 last:border-0 dark:border-white/5">
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
