import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Skeleton from "./ui/Skeleton.jsx";
import { landingFeatureCards } from "../data/landingContent.js";
import { getPublicPlatformStats } from "../services/publicService.js";
import { formatLandingStat } from "../utils/landingStats.js";

function FeaturesSkeleton() {
  return (
    <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Imkoniyatlar yuklanmoqda">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="glass-card rounded-[2rem] p-6">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="mt-7 h-7 w-3/4" />
          <Skeleton className="mt-4 h-16 w-full" />
          <Skeleton className="mt-7 h-16 w-full rounded-3xl" />
        </div>
      ))}
    </div>
  );
}

export default function FeaturesSection() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPublicPlatformStats();
        if (isMounted) {
          setStats(data);
        }
      } catch {
        if (isMounted) {
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

  return (
    <section id="features" className="section-padding relative">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Abituriyentga kerak bo&apos;lgan hamma narsa</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Ishonchli tanlov real talabalar fikridan boshlanadi.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            MyUni.uz reyting, sharh, hamjamiyat va muhokamalarni bitta zamonaviy platformaga jamlaydi.
          </p>
        </div>

        {isLoading && <FeaturesSkeleton />}

        {!isLoading && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {landingFeatureCards.map((feature, index) => {
              const metricValue = stats ? formatLandingStat(stats[feature.metricKey]) : "—";

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="glass-card group rounded-[2rem] p-6 transition"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-premium-gradient text-lg font-black text-white shadow-glow">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 dark:text-slate-300">{feature.description}</p>
                  <div className="mt-5 rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
                    <p className="text-xl font-black text-primary sm:text-2xl">{metricValue}</p>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {feature.label}
                    </p>
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
