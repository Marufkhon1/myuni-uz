import { useEffect, useState } from "react";
import Skeleton from "./ui/Skeleton.jsx";
import { getPublicPlatformStats } from "../services/publicService.js";
import { buildHeroStats } from "../utils/landingStats.js";
import { scrollToLandingSection } from "../utils/landingScroll.js";

const floatingCards = [
  { title: "Universitet tanlash", caption: "Ma'lumotlar bir joyda", position: "-left-8 top-12", delayClass: "" },
  { title: "Talaba fikri", caption: "Haqiqiy sharhlar asosida", position: "-right-7 top-28", delayClass: "hero-float-card-delay-1" },
  { title: "Hamjamiyat", caption: "Savol va javoblar uchun", position: "left-10 top-72", delayClass: "hero-float-card-delay-2" },
];

const loadingStats = [
  { value: "…", label: "Universitet" },
  { value: "…", label: "Tasdiqlangan sharh" },
  { value: "…", label: "Ro'yxatdan o'tgan" },
];

function HeroStatsGrid({ stats, isLoading }) {
  if (!isLoading && !stats) {
    return null;
  }

  const items = isLoading ? loadingStats : stats;

  return (
    <dl className="mt-10 grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-soft backdrop-blur sm:grid-cols-3 sm:gap-4 dark:border-white/10 dark:bg-white/5">
      {items.map(({ value, label }) => (
        <div
          key={label}
          className="rounded-2xl px-2 py-1 text-center transition hover:bg-white/80 lg:text-left dark:hover:bg-white/[0.06]"
        >
          {isLoading ? (
            <>
              <Skeleton className="mx-auto h-8 w-16 lg:mx-0" />
              <Skeleton className="mx-auto mt-2 h-3 w-24 lg:mx-0" />
            </>
          ) : (
            <>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {label}
              </dt>
              <dd className="text-2xl font-black text-slate-950 dark:text-white">{value}</dd>
            </>
          )}
        </div>
      ))}
    </dl>
  );
}

export default function HeroSection() {
  const [platformStats, setPlatformStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const data = await getPublicPlatformStats();
        if (isMounted) {
          setPlatformStats(data);
        }
      } catch {
        if (isMounted) {
          setPlatformStats(null);
        }
      } finally {
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroStats = buildHeroStats(platformStats);

  return (
    <section id="home" className="relative isolate overflow-hidden pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-14 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.20),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.18),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.22),transparent_32%)]" />
      <div className="absolute left-1/2 top-32 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="container-shell grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14">
        <div className="hero-enter-left mx-auto max-w-4xl text-center lg:mx-0 lg:text-left [animation:hero-fade-up_0.7s_ease-out_both]">
          <span className="eyebrow">To&apos;g&apos;ri universitet, to&apos;g&apos;ri kelajak</span>
          <h1 className="responsive-heading-xl mt-6 text-slate-950 dark:text-white sm:mt-7">
            Eng yaxshi universitetni haqiqiy talabalar tajribasi orqali toping
          </h1>
          <p className="responsive-prose mx-auto mt-5 max-w-2xl text-slate-600 sm:mt-6 lg:mx-0 dark:text-slate-300">
            Universitetlarni solishtiring, ishonchli sharhlarni o&apos;qing va kelajagingiz
            uchun muhim qaror qabul qilishdan oldin real talabalar fikrini bilib oling.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <a
              href="#universities"
              className="landing-btn-gradient px-7 py-4 text-center text-base"
              onClick={(event) => {
                event.preventDefault();
                scrollToLandingSection("#universities");
                window.history.replaceState(null, "", "#universities");
              }}
            >
              Universitetlarni ko&apos;rish
            </a>
            <a
              href="#how-it-works"
              className="landing-btn-outline px-7 py-4 text-center text-base"
              onClick={(event) => {
                event.preventDefault();
                scrollToLandingSection("#how-it-works");
                window.history.replaceState(null, "", "#how-it-works");
              }}
            >
              Qanday ishlaydi?
            </a>
          </div>
          <HeroStatsGrid stats={heroStats} isLoading={isStatsLoading} />
        </div>

        <div className="hero-enter-right relative mx-auto w-full max-w-xl [animation:hero-fade-scale_0.7s_ease-out_0.15s_both]">
          <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="relative h-[min(340px,46vh)] min-h-[240px] overflow-hidden rounded-[1.5rem] bg-premium-gradient sm:h-[360px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_22%),linear-gradient(180deg,transparent,rgba(15,23,42,0.55))]" />
              <div className="absolute left-6 top-6 max-w-[75%] rounded-2xl border border-white/25 bg-white/20 p-4 text-white backdrop-blur-xl sm:left-8 sm:top-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                  myuni.uz
                </p>
                <p className="mt-1.5 text-xl font-black leading-snug sm:text-2xl">
                  Universitet tanlash platformasi
                </p>
              </div>
              <div className="absolute bottom-16 right-6 grid gap-2 sm:bottom-20 sm:right-8">
                {["Sharhlar", "Universitetlar", "Hamjamiyat"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/25 bg-white/20 px-3.5 py-1.5 text-xs font-black text-white backdrop-blur-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Muhokamada
                  </p>
                  <p className="mt-0.5 text-sm font-black leading-snug text-slate-950 sm:text-base dark:text-white">
                    Talabalar bilan qabul bo&apos;yicha savol-javob
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  Jonli
                </span>
              </div>
            </div>
          </div>

          {floatingCards.map((card) => (
            <article
              key={card.title}
              className={`hero-float-card absolute hidden w-44 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-soft transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow dark:border-white/10 dark:bg-slate-900/95 lg:block ${card.position} ${card.delayClass}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {card.title}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.caption}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
