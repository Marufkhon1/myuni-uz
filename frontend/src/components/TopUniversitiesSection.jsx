import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UniversityCampusBanner from "./UniversityCampusBanner.jsx";
import UniversityMetaLine from "./UniversityMetaLine.jsx";
import UniversityRatingStars from "./dashboard/UniversityRatingStars.jsx";
import LandingUniversitiesSkeleton from "./skeletons/LandingSkeletons.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { getPublicTopUniversities } from "../services/publicService.js";
import { buildReviewsHubPath, buildUniversityPublicPath } from "../utils/navigation.js";

export default function TopUniversitiesSection() {
  const toast = useToast();
  const { isAuthenticated, isLoading, role } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const allUniversitiesPath = buildReviewsHubPath({ role, isAuthenticated });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPublicTopUniversities();
        if (isMounted) {
          setUniversities(data);
        }
      } catch {
        if (isMounted) {
          setUniversities([]);
          toast.error("Universitetlar yuklanmadi. Internetni tekshiring yoki sahifani yangilang.");
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  return (
    <section
      id="universities"
      className="section-padding bg-slate-50/80 dark:bg-slate-900/40"
    >
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">Top universitetlar</span>
            <h2 className="responsive-heading-lg mt-5 text-slate-950 dark:text-white">
              Talabalar eng ko'p qiziqadigan universitetlarni ko'ring.
            </h2>
          </div>
          {isLoading ? (
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-400 dark:border-white/10 dark:bg-white/10">
              Tekshirilmoqda...
            </span>
          ) : (
            <Link
              to={allUniversitiesPath}
              className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-900 shadow-soft transition hover:-translate-y-1 hover:border-primary dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              Barchasini ko'rish
            </Link>
          )}
        </div>

        {isFetching && <LandingUniversitiesSkeleton />}

        {!isFetching && universities.length === 0 && (
          <p className="mt-12 text-center font-black text-slate-500">
            Hali universitet ma'lumoti yo'q.
          </p>
        )}

        {!isFetching && universities.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((university, index) => {
              const publicPath = buildUniversityPublicPath(university);

              return (
                <motion.article
                  key={university.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.1, duration: 0.55 }}
                  whileHover={{ y: -10 }}
                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition dark:border-white/10 dark:bg-white/[0.06]"
                >
                  <UniversityCampusBanner university={university} className="h-52 sm:h-56" />
                  <div className="p-6">
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white">{university.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {university.location}
                    </p>
                    <UniversityMetaLine
                      university={university}
                      className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300"
                    />
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <UniversityRatingStars rating={university.average_rating} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {university.review_count ?? 0} sharh
                      </span>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/10">
                      <span className="text-sm font-bold text-slate-500">Universitet profili</span>
                      {isLoading ? (
                        <span className="text-sm font-black text-slate-400">Tekshirilmoqda...</span>
                      ) : (
                        <Link to={publicPath} className="text-sm font-black text-primary">
                          Batafsil
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
