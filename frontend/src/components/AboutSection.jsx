import { Link } from "react-router-dom";
import Skeleton from "./ui/Skeleton.jsx";
import { getPublicPlatformStats } from "../services/publicService.js";
import { buildAboutStats } from "../utils/landingStats.js";
import { trackHubCta } from "@/lib/analytics.js";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function AboutStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function AboutSection() {
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const stats = await getPublicPlatformStats();
        if (isMounted) {
          setFacts(buildAboutStats(stats));
        }
      } catch {
        if (isMounted) {
          setFacts([]);
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

  return (
    <section id="about" className="section-padding bg-slate-50/80 dark:bg-slate-900/40">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10 dark:border-white/10 dark:bg-white/[0.06]"
        >
          <div>
            <span className="eyebrow">Biz haqimizda</span>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              MyUni.uz nima?
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              MyUni.uz — abituriyent va talabalar uchun universitetlarni real sharhlar, ochiq
              ma&apos;lumot va taqqoslash orqali tanlash platformasi.
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Missiya, tahririy siyosat, tasdiqlash jarayoni va reyting qanday ishlashi haqida
              to&apos;liq ma&apos;lumot alohida sahifada.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Quyidagi raqamlar platforma bazasidan avtomatik olinadi — qo&apos;lda yozilgan reklama emas.
            </p>
            <Link
              to="/haqida"
              onClick={() => trackHubCta("/haqida", "landing_about")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              To&apos;liq haqida sahifasi
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid content-center gap-6">
            {isLoading && <AboutStatsSkeleton />}

            {!isLoading && facts.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
                    <p className="text-3xl font-black text-primary">{fact.value}</p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      {fact.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && facts.length === 0 && (
              <p className="rounded-3xl bg-slate-50 p-5 text-sm font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                Platforma statistikasi hozircha yuklanmadi.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
