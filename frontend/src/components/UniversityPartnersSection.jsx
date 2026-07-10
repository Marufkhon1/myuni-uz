import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UniversityAvatar from "./UniversityAvatar.jsx";
import Skeleton from "./ui/Skeleton.jsx";
import StarRatingDisplay from "./ui/StarRatingDisplay.jsx";
import {
  getPublicFeaturedUniversities,
  getPublicPlatformStats,
} from "../services/publicService.js";
import { formatLandingRating, formatLandingStat } from "../utils/landingStats.js";
import { buildUniversityPublicPath } from "../utils/navigation.js";

function PartnersSkeleton() {
  return (
    <div className="mt-10 space-y-4" aria-busy="true" aria-label="Universitet logotiplari yuklanmoqda">
      <div className="mx-auto grid max-w-lg grid-cols-1 gap-3 sm:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden space-y-4 sm:block">
        {Array.from({ length: 2 }, (_, row) => (
          <div key={row} className="flex justify-center gap-4 overflow-hidden">
            {Array.from({ length: 6 }, (__, index) => (
              <div
                key={index}
                className="w-44 shrink-0 rounded-[1.35rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <Skeleton className="mx-auto h-16 w-16 rounded-full" />
                <Skeleton className="mx-auto mt-3 h-4 w-24" />
                <Skeleton className="mx-auto mt-2 h-3 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnerLogoCard({ university, rankIndex, layout = "tile" }) {
  const publicPath = buildUniversityPublicPath(university);
  const rating = formatLandingRating(university.average_rating);
  const isTop = rankIndex >= 0 && rankIndex < 3;
  const meta = [
    university.review_count > 0 ? `${formatLandingStat(university.review_count)} sharh` : null,
    university.member_count > 0 ? `${formatLandingStat(university.member_count)} a'zo` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (layout === "row") {
    return (
      <Link
        to={publicPath}
        className="partner-logo-card group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-soft transition dark:border-white/10 dark:bg-white/[0.05]"
      >
        <div className="partner-logo-image shrink-0">
          <UniversityAvatar university={university} size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {isTop ? (
              <span className="inline-flex shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                Top {rankIndex + 1}
              </span>
            ) : null}
            <p className="truncate text-sm font-black text-slate-800 transition group-hover:text-primary dark:text-slate-100">
              {university.short_name || university.name}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {meta || <span className="text-slate-400 dark:text-slate-500">Profil ochiq</span>}
          </p>
        </div>
        <div className="shrink-0">
          {rating != null ? (
            <StarRatingDisplay
              rating={Number(rating)}
              variant="pill"
              showNumeric
              className="px-2 py-0.5"
              starClassName="text-[11px]"
              numericClassName="text-[10px] font-black text-amber-700 dark:text-amber-200"
            />
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
              Hali baho yo&apos;q
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={publicPath}
      className="partner-logo-card group flex w-44 shrink-0 flex-col items-center rounded-[1.35rem] border border-slate-200 bg-white px-4 py-5 text-center shadow-soft transition dark:border-white/10 dark:bg-white/[0.05] min-h-[13.5rem]"
    >
      {isTop ? (
        <span className="mb-2 inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
          Top {rankIndex + 1}
        </span>
      ) : (
        <span className="mb-2 h-[18px]" aria-hidden="true" />
      )}
      <div className="partner-logo-image">
        <UniversityAvatar university={university} size="lg" />
      </div>
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-black leading-snug text-slate-800 transition group-hover:text-primary dark:text-slate-100">
        {university.short_name || university.name}
      </p>
      <div className="mt-2 flex min-h-[1.75rem] items-center justify-center">
        {rating != null ? (
          <StarRatingDisplay
            rating={Number(rating)}
            variant="pill"
            showNumeric
            className="px-2 py-0.5"
            starClassName="text-[11px]"
            numericClassName="text-[10px] font-black text-amber-700 dark:text-amber-200"
          />
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            Hali baho yo&apos;q
          </span>
        )}
      </div>
      <p className="mt-2 min-h-[1rem] text-[11px] font-semibold leading-4 text-slate-500 dark:text-slate-400">
        {meta || <span className="text-slate-400 dark:text-slate-500">Profil ochiq</span>}
      </p>
    </Link>
  );
}

function PartnerMarqueeRow({ universities, reverse = false, ariaLabel }) {
  const trackItems = useMemo(
    () => (universities.length > 0 ? [...universities, ...universities] : []),
    [universities]
  );

  if (trackItems.length === 0) {
    return null;
  }

  return (
    <div className="partners-marquee hide-scrollbar" aria-label={ariaLabel}>
      <div className={`partners-track ${reverse ? "partners-track--reverse" : ""}`}>
        {trackItems.map((university, index) => (
          <PartnerLogoCard
            key={`${university.id}-${index}`}
            university={university}
            rankIndex={index < universities.length ? index : -1}
          />
        ))}
      </div>
    </div>
  );
}

export default function UniversityPartnersSection() {
  const [universities, setUniversities] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [featured, platformStats] = await Promise.all([
          getPublicFeaturedUniversities(16),
          getPublicPlatformStats(),
        ]);
        if (isMounted) {
          setUniversities(featured);
          setStats(platformStats);
        }
      } catch {
        if (isMounted) {
          setUniversities([]);
          setStats(null);
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

  const { rowA, rowB } = useMemo(() => {
    if (universities.length === 0) {
      return { rowA: [], rowB: [] };
    }
    const midpoint = Math.ceil(universities.length / 2);
    return {
      rowA: universities.slice(0, midpoint),
      rowB: universities.slice(midpoint),
    };
  }, [universities]);

  if (!isLoading && universities.length === 0) {
    return null;
  }

  return (
    <section
      id="partners"
      className="section-padding overflow-hidden border-y border-slate-200/70 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 dark:border-white/10 dark:from-slate-900/40 dark:via-slateNight dark:to-slate-900/30"
    >
      <div className="container-shell min-w-0">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Platformadagi OTMlar</span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
            O&apos;zbekiston universitetlari bir joyda
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            Har bir universitet uchun sharhlar, reyting va talabalar chat jamoasi. Logotiplar
            ma&apos;lumot ko&apos;rinishi uchun — rasmiy hamkorlik emas.
          </p>
          {stats && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                {formatLandingStat(stats.university_count)} ta OTM
              </span>
              <span className="rounded-full border border-primary/20 bg-blue-50 px-4 py-2 text-sm font-black text-primary dark:border-primary/30 dark:bg-blue-400/10 dark:text-blue-200">
                {formatLandingStat(stats.review_count)} ta sharh
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                {formatLandingStat(stats.member_count)} foydalanuvchi
              </span>
            </div>
          )}
        </div>

        {isLoading && <PartnersSkeleton />}

        {!isLoading && universities.length > 0 && (
          <>
            <div className="mx-auto mt-10 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:hidden">
              {universities.map((university, index) => (
                <PartnerLogoCard
                  key={university.id}
                  university={university}
                  rankIndex={index}
                  layout="row"
                />
              ))}
            </div>

            <div className="mt-10 hidden space-y-4 sm:block">
              <PartnerMarqueeRow
                universities={rowA}
                ariaLabel="Faol universitetlar — birinchi qator"
              />
              {rowB.length > 0 && (
                <PartnerMarqueeRow
                  universities={rowB}
                  reverse
                  ariaLabel="Faol universitetlar — ikkinchi qator"
                />
              )}
            </div>
          </>
        )}

        {!isLoading && universities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="mt-10 flex flex-col items-center gap-4 text-center"
          >
            <p className="max-w-2xl text-xs leading-6 text-slate-500 dark:text-slate-400">
              Universitet logotiplari va nomlari faqat ma&apos;lumot berish maqsadida ko&apos;rsatiladi.
              Rasmiy hamkorlik yoki tasdiq bildirilmaydi. OTM vakillari o&apos;zgartirish yoki olib
              tashlashni so&apos;rashlari mumkin.
            </p>
            <Link to="/universitetlar" className="landing-btn-gradient px-7 py-3.5 text-sm">
              Barcha universitetlar
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
