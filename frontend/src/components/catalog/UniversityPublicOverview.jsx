import { buildUniversityQuickFacts, summarizeDirections } from "@/utils/universityPublic.js";

function StatPill({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        accent
          ? "border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10"
          : "border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default function UniversityPublicOverview({ detail }) {
  const facts = buildUniversityQuickFacts(detail);
  const directionCounts = summarizeDirections(detail.faculties);
  const rating = detail.average_rating;
  const reviewCount = detail.review_count ?? 0;

  if (!facts.length && directionCounts.total === 0 && !rating) {
    return null;
  }

  return (
    <section
      id="overview"
      className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6"
      aria-label="Qisqa ko'rsatkichlar"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatPill
          label="O'rtacha baho"
          value={rating != null ? `${rating} / 5` : "—"}
          accent={rating != null}
        />
        <StatPill label="Sharhlar" value={reviewCount} />
        {directionCounts.bachelor > 0 && (
          <StatPill label="Bakalavr" value={`${directionCounts.bachelor} yo'nalish`} />
        )}
        {directionCounts.master > 0 && (
          <StatPill label="Magistratura" value={`${directionCounts.master} mutaxassislik`} accent />
        )}
        {directionCounts.doctorate > 0 && (
          <StatPill label="Doktorantura" value={`${directionCounts.doctorate} yo'nalish`} accent />
        )}
      </div>

      {facts.length > 0 && (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{fact.label}</dt>
              <dd className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
