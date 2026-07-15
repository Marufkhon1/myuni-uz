import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buildUniversityPublicPath } from "@/utils/navigation.js";
import { getPublicRelatedUniversities } from "@/services/publicService.js";
import UniversityCampusBanner from "@/components/UniversityCampusBanner.jsx";
import UniversityRatingStars from "@/components/dashboard/UniversityRatingStars.jsx";

/**
 * Related universities rail — same city / ownership heuristic from API.
 */
export default function RelatedUniversities({ slug, className = "" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) {
      return undefined;
    }
    let alive = true;
    setLoading(true);
    getPublicRelatedUniversities(slug)
      .then((data) => {
        if (alive) {
          setRows(Array.isArray(data) ? data : data?.results || []);
        }
      })
      .catch(() => {
        if (alive) {
          setRows([]);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (!loading && rows.length === 0) {
    return (
      <section
        className={"border-t border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6 " + className}
        aria-labelledby="related-universities-heading"
      >
        <h2
          id="related-universities-heading"
          className="text-xs font-black uppercase tracking-wide text-primary"
        >
          O&apos;xshash universitetlar
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Hozircha o&apos;xshash OTM topilmadi.{" "}
          <Link to="/universitetlar" className="font-bold text-primary hover:underline">
            Katalogga o&apos;ting
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section
      className={"border-t border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6 " + className}
      aria-labelledby="related-universities-heading"
    >
      <h2
        id="related-universities-heading"
        className="text-xs font-black uppercase tracking-wide text-primary"
      >
        O&apos;xshash universitetlar
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Xuddi shu shahar yoki turdagi boshqa OTMlar — yonma-yon solishtirish uchun.
      </p>

      {loading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map((uni) => {
            const path = buildUniversityPublicPath(uni);
            return (
              <li key={uni.id || uni.slug}>
                <Link
                  to={path}
                  className="group flex gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden sm:w-24">
                    <UniversityCampusBanner university={uni} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1 py-2.5 pr-3">
                    <p className="truncate text-sm font-black text-slate-950 group-hover:text-primary dark:text-white">
                      {uni.short_name || uni.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                      {uni.city || uni.location || "—"}
                    </p>
                    <div className="mt-1.5">
                      <UniversityRatingStars
                        rating={uni.display_rating ?? uni.bayesian_rating ?? uni.average_rating}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
