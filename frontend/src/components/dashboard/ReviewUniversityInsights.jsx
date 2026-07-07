import { Link } from "react-router-dom";
import { buildUniversityPublicPath } from "@/utils/navigation.js";

function FactRow({ label, value }) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-white/10">
      <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right text-sm font-black text-slate-800 dark:text-white">{value}</dd>
    </div>
  );
}

export default function ReviewUniversityInsights({
  university,
  isStudent,
  reviewCount,
  averageRating,
  totalLikes,
  memberCount,
}) {
  if (!university) {
    return null;
  }

  const publicPath = buildUniversityPublicPath(university);
  const hasPublicPage = publicPath.startsWith("/universitet/");
  const avgLikes =
    reviewCount > 0 ? (totalLikes / reviewCount).toFixed(1).replace(/\.0$/, "") : null;

  const tip = isStudent
    ? "Sharh qoldiring yoki chatda boshqa talabalar bilan muloqot qiling — tanlovingiz aniqroq bo'ladi."
    : "Sharhlarni o'qing, taqqoslang va chatda to'g'ridan-to'g'ri talabalardan savol bering.";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Asosiy ma&apos;lumot</p>
        <dl className="mt-2">
          <FactRow label="Joylashuv" value={university.location} />
          <FactRow label="Turi" value={university.institution_type} />
          <FactRow
            label="Tashkil etilgan"
            value={university.founded_year ? `${university.founded_year}-yil` : null}
          />
          <FactRow
            label="O'rtacha like / sharh"
            value={avgLikes != null ? `${avgLikes} ta` : null}
          />
        </dl>
        {university.description && !university.summary && (
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {university.description}
          </p>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-primary/15 bg-blue-50/50 p-4 dark:border-primary/25 dark:bg-blue-400/10">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Tanlov bo&apos;yicha</p>
        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{tip}</p>
        <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          {averageRating != null && (
            <li>
              Talabalar bahosi: <span className="font-black text-primary">{averageRating}/5</span>
            </li>
          )}
          {reviewCount > 0 && (
            <li>
              {reviewCount} ta sharh — batafsil pastda
            </li>
          )}
          {memberCount > 0 ? (
            <li>{memberCount} kishi guruh chatida faol</li>
          ) : (
            <li>Guruh chatida hali a&apos;zo kam — birinchi bo&apos;lib qo&apos;shilishingiz mumkin</li>
          )}
        </ul>
        {hasPublicPage && (
          <Link
            to={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-black text-primary hover:underline"
          >
            Ochiq sahifani ko&apos;rish →
          </Link>
        )}
      </div>
    </div>
  );
}
