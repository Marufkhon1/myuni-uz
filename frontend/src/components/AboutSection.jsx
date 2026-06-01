import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Skeleton from "./ui/Skeleton.jsx";
import { getPublicPlatformStats } from "../services/publicService.js";
import { buildAboutStats } from "../utils/landingStats.js";

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
              MyUni.uz talabalar tomonidan ishlab chiqilayotgan biznes loyiha.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Ushbu loyiha Toshkent davlat iqtisodiyot universiteti Samarqand filiali
              Raqamli iqtisodiyot guruhi tomonidan tayyorlanmoqda. Maqsadimiz abituriyent va
              talabalarga universitet tanlashda real tajriba, sharh va foydali ma&apos;lumotlarni
              qulay formatda taqdim etish.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Quyidagi raqamlar platformadagi jonli ma&apos;lumotlardan olinadi — statik reklama emas.
            </p>
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
