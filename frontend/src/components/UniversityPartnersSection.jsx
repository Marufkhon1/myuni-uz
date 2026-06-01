import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UniversityAvatar from "./UniversityAvatar.jsx";
import Skeleton from "./ui/Skeleton.jsx";
import { getPublicFeaturedUniversities } from "../services/publicService.js";
import { buildUniversityPublicPath } from "../utils/navigation.js";

function PartnersSkeleton() {
  return (
    <div
      className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      aria-busy="true"
      aria-label="Universitet logotiplari yuklanmoqda"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex flex-col items-center rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="mt-3 h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function UniversityPartnersSection() {
  const [universities, setUniversities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPublicFeaturedUniversities(12);
        if (isMounted) {
          setUniversities(data);
        }
      } catch {
        if (isMounted) {
          setUniversities([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && universities.length === 0) {
    return null;
  }

  return (
    <section id="partners" className="section-padding border-y border-slate-200/70 bg-slate-50/70 dark:border-white/10 dark:bg-slate-900/30">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Platformadagi OTMlar</span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            O&apos;zbekiston universitetlari bir joyda.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Har bir universitet uchun alohida sharhlar, reyting va talabalar chat jamoasi mavjud.
            Logotiplar ma&apos;lumot ko&apos;rinishi uchun — rasmiy hamkorlik emas.
          </p>
        </div>

        {isLoading && <PartnersSkeleton />}

        {!isLoading && universities.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {universities.map((university, index) => {
              const publicPath = buildUniversityPublicPath(university);

              return (
                <motion.div
                  key={university.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                >
                  <Link
                    to={publicPath}
                    className="partner-logo-card group flex h-full min-h-[10.5rem] flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-soft transition dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <UniversityAvatar university={university} size="lg" />
                    <p className="mt-3 line-clamp-2 text-sm font-black text-slate-800 transition group-hover:text-primary dark:text-slate-100">
                      {university.short_name || university.name}
                    </p>
                    {(university.review_count > 0 || university.member_count > 0) && (
                      <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {university.review_count > 0 && `${university.review_count} sharh`}
                        {university.review_count > 0 && university.member_count > 0 && " · "}
                        {university.member_count > 0 && `${university.member_count} a'zo`}
                      </p>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
