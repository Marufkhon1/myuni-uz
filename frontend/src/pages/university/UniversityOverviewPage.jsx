import { Link, useOutletContext } from "react-router-dom";
import UniversityPublicContact from "@/components/catalog/UniversityPublicContact.jsx";
import UniversityPublicOverview from "@/components/catalog/UniversityPublicOverview.jsx";
import UniversityPublicSummary from "@/components/catalog/UniversityPublicSummary.jsx";
import { buildUniversitySiloPath } from "@/config/universitySilos.js";
import { getUniversityOgImagePath } from "@/utils/universityImage.js";
import { summarizeDirections } from "@/utils/universityPublic.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";

/**
 * Thin hub — overview teasers only (no full reviews/faculties/admission bodies).
 */
export default function UniversityOverviewPage() {
  const { detail, slug } = useOutletContext();
  const directions = summarizeDirections(detail?.faculties);

  usePageMeta({
    title: detail ? `${detail.name} | MyUni.uz` : "Universitet | MyUni.uz",
    description: detail
      ? `${detail.name} (${detail.location}): soft reyting, qisqa ma'lumot, kontakt va silolar — sharhlar, fakultetlar, qabul.`
      : "O'zbekiston universitetlari haqida ochiq ma'lumot.",
    path: slug ? `/universitet/${slug}` : undefined,
    image: detail ? getUniversityOgImagePath(detail) : undefined,
    imageAlt: detail ? `${detail.name} — MyUni.uz` : undefined,
  });

  if (!detail) {
    return null;
  }

  const silos = [
    {
      to: buildUniversitySiloPath(slug, "reviews"),
      title: "Sharhlar",
      body: `${detail.review_count ?? 0} ta tasdiqlangan talaba sharhi`,
    },
  ];
  if (directions.total > 0 || (detail.faculties?.length ?? 0) > 0) {
    silos.push({
      to: buildUniversitySiloPath(slug, "faculties"),
      title: "Fakultetlar",
      body: directions.total
        ? `${directions.total} ta yo'nalish / mutaxassislik`
        : "Fakultet va yo'nalishlar",
    });
  }
  if (detail.admission_cycles?.length > 0) {
    silos.push({
      to: buildUniversitySiloPath(slug, "admission"),
      title: "Qabul",
      body: `${detail.admission_cycles.length} ta qabul tsikli`,
    });
  }

  return (
    <div>
      <UniversityPublicOverview detail={detail} />
      <UniversityPublicSummary summary={detail.summary} />
      <UniversityPublicContact detail={detail} />

      <section
        className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6"
        aria-labelledby="university-silos-heading"
      >
        <h2
          id="university-silos-heading"
          className="text-xs font-black uppercase tracking-wide text-primary"
        >
          Bo&apos;limlar
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          To&apos;liq kontent alohida sahifalarda — indekslash va navigatsiya uchun.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {silos.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 transition hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="text-sm font-black text-slate-950 dark:text-white">
                  {item.title}
                </span>
                <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {item.body}
                </span>
                <span className="mt-3 text-xs font-bold text-primary">Ochish →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
