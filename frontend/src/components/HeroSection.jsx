import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroRotatingText from "./HeroRotatingText.jsx";
import HeroSearchBar from "./HeroSearchBar.jsx";
import Skeleton from "./ui/Skeleton.jsx";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { getPublicPlatformStats } from "../services/publicService.js";
import { buildHeroStats, formatLandingStat } from "../utils/landingStats.js";

const headlineWords = ["toping", "tanlang", "solishtiring", "baholang"];

const previewRotatingPhrases = ["haqiqiy sharhlar", "keng katalog", "talaba suhbatlari"];

const heroPreviewBg = "/images/hero/landing-campus.jpg";

const previewTabs = [
  {
    id: "reviews",
    label: "Sharhlar",
    caption: "Talaba tajribasi",
    panelTitle: "Haqiqiy sharhlar",
    panelText: "Reyting, tafsilotlar va moderatsiyadan o'tgan fikrlar bir joyda.",
  },
  {
    id: "universities",
    label: "Universitetlar",
    captionKey: "universities",
    panelTitle: "Keng katalog",
    panelText: "Filtrlash, solishtirish va batafsil ma'lumotlar.",
  },
  {
    id: "community",
    label: "Hamjamiyat",
    caption: "OTM guruhlari",
    panelTitle: "Talaba suhbatlari",
    panelText: "Qabul, grant va talaba hayoti haqida ochiq savol-javob.",
  },
];

const innerFloatCards = [
  {
    title: "Universitet tanlash",
    caption: "Ma'lumotlar bir joyda",
    className: "left-4 top-4 hero-float-card-delay-1",
  },
  {
    title: "Talaba fikri",
    caption: "Haqiqiy sharhlar",
    className: "right-4 top-20",
  },
];

const loadingStats = [
  { value: "…", label: "Universitet" },
  { value: "…", label: "Sharhlar" },
  { value: "…", label: "Ro'yxatdan o'tgan" },
];

function HeroStatsGrid({ stats, isLoading, isDark }) {
  if (!isLoading && !stats) {
    return null;
  }

  const items = isLoading ? loadingStats : stats;

  return (
    <dl
      className={
        "mt-8 grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-3 sm:gap-4 sm:p-5 " +
        (isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200/80 bg-white/70 shadow-sm")
      }
    >
      {items.map(({ value, label }) => (
        <div key={label} className="rounded-xl px-1 py-0.5 text-center sm:text-left">
          {isLoading ? (
            <>
              <Skeleton className={"mx-auto h-8 w-16 sm:mx-0 " + (isDark ? "bg-white/10" : "bg-slate-200")} />
              <Skeleton className={"mx-auto mt-2 h-3 w-24 sm:mx-0 " + (isDark ? "bg-white/10" : "bg-slate-200")} />
            </>
          ) : (
            <>
              <dt
                className={
                  "text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px] " +
                  (isDark ? "text-slate-400" : "text-slate-500")
                }
              >
                {label}
              </dt>
              <dd className={"mt-1 text-2xl font-black sm:text-[1.75rem] " + (isDark ? "text-white" : "text-slate-950")}>
                {value}
              </dd>
            </>
          )}
        </div>
      ))}
    </dl>
  );
}

function HeroTrustStrip({ isDark, reviewCount }) {
  const chipClass =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition sm:text-[13px] " +
    (isDark
      ? "bg-white/[0.06] text-slate-300 ring-1 ring-inset ring-white/10 hover:bg-white/[0.1] hover:text-white hover:ring-white/20"
      : "bg-slate-100/90 text-slate-600 ring-1 ring-inset ring-slate-200/80 hover:bg-white hover:text-primary hover:ring-primary/25");

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Ishonch va tez ishlar">
      <span
        className={
          "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold sm:text-[13px] " +
          (isDark
            ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-inset ring-emerald-400/25"
            : "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80")
        }
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        {reviewCount != null
          ? `${formatLandingStat(reviewCount)} ta moderatsiyadan o'tgan sharh`
          : "Moderatsiyadan o'tgan sharhlar"}
      </span>

      <Link to="/ishonch-xavfsizlik" className={chipClass}>
        Ishonch qoidalari
      </Link>
      <Link to="/taqqoslash" className={chipClass}>
        OTMlarni taqqoslash
        <span aria-hidden="true" className="text-[10px] opacity-70">
          →
        </span>
      </Link>
    </div>
  );
}

function HeroPreviewPanel({ isDark, universityCaption, footerStat }) {
  const [activeTabId, setActiveTabId] = useState("reviews");
  const activeTab = previewTabs.find((tab) => tab.id === activeTabId) ?? previewTabs[0];

  return (
    <div
      className={
        "hero-preview-panel overflow-hidden rounded-[1.75rem] ring-1 shadow-[0_32px_64px_-20px_rgba(15,23,42,0.35)] " +
        (isDark ? "ring-white/10" : "ring-slate-900/5")
      }
    >
      <div className="relative min-h-[340px] overflow-hidden sm:min-h-[400px]">
        <img
          src={heroPreviewBg}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[center_35%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-indigo-900/45 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(56,189,248,0.22),transparent_28%)]" />

        {innerFloatCards.map((card) => (
          <article
            key={card.title}
            className={
              "hero-float-card absolute z-10 hidden max-w-[10rem] rounded-2xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:block " +
              card.className
            }
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">{card.title}</p>
            <p className="mt-0.5 text-[11px] font-medium leading-4 text-slate-600">{card.caption}</p>
          </article>
        ))}

        <div className="relative z-20 flex h-full min-h-[340px] flex-col justify-between p-5 sm:min-h-[400px] sm:p-6">
          <div className="max-w-[92%] pt-14 sm:pt-[4.5rem]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200/90">myuni.uz</p>
            <p className="mt-2 text-2xl font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-[1.7rem]">
              Universitet tanlash platformasi
            </p>

            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 overflow-visible py-0.5 text-sm font-semibold text-white/80">
              <span>Bir joyda:</span>
              <span className="inline-block overflow-visible py-0.5">
                <HeroRotatingText
                  words={previewRotatingPhrases}
                  variant="light"
                  intervalMs={3000}
                  className="font-black"
                />
              </span>
            </p>

            <div className="mt-3 min-h-[3.25rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-sm font-black text-white">{activeTab.panelTitle}</p>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-white/85">{activeTab.panelText}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Platforma bo'limlari">
            {previewTabs.map((tab) => {
              const isActive = tab.id === activeTabId;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTabId(tab.id)}
                  className={
                    "rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " +
                    (isActive
                      ? "scale-[1.02] border-white bg-white shadow-[0_10px_28px_-8px_rgba(15,23,42,0.45)]"
                      : "border-white/35 bg-white/80 hover:bg-white/95")
                  }
                >
                  <p className={"text-xs font-black " + (isActive ? "text-primary" : "text-slate-900")}>
                    {tab.label}
                  </p>
                  <p className={"mt-0.5 text-[11px] font-semibold " + (isActive ? "text-slate-600" : "text-slate-500")}>
                    {tab.captionKey === "universities" ? universityCaption : tab.caption}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={
          "flex items-center justify-between gap-3 border-t px-4 py-3.5 sm:px-5 " +
          (isDark ? "border-white/10 bg-slate-950/95" : "border-slate-200/80 bg-white")
        }
      >
        <div className="min-w-0">
          <p className={"text-[11px] font-bold uppercase tracking-wide " + (isDark ? "text-slate-400" : "text-slate-500")}>
            Ishonch
          </p>
          <p className={"mt-0.5 text-sm font-black leading-snug " + (isDark ? "text-white" : "text-slate-950")}>
            Moderatsiya · Kampus ovozi · Shikoyat
          </p>
        </div>
        <span
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black " +
            (isDark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-100 text-emerald-700")
          }
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          {footerStat}
        </span>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { isDark } = useDarkMode();
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
  const universityCaption = platformStats?.university_count
    ? `${formatLandingStat(platformStats.university_count)} ta OTM`
    : "OTM katalogi";
  const footerStat = platformStats?.review_count
    ? `${formatLandingStat(platformStats.review_count)} sharh`
    : "Haqiqiy ma'lumot";

  return (
    <section
      id="home"
      className={
        "relative isolate overflow-x-clip pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-16 sm:pt-32 sm:pb-20 lg:min-h-[min(860px,90vh)] lg:pt-36 lg:pb-24 " +
        (isDark
          ? "bg-gradient-to-br from-slate-950 via-[#0c1528] to-[#111827]"
          : "bg-gradient-to-br from-slate-50 via-white to-blue-50/70")
      }
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className={
            "absolute -right-24 top-28 h-72 w-72 rounded-full blur-3xl " +
            (isDark ? "bg-blue-500/15" : "bg-blue-400/20")
          }
        />
        <div
          className={
            "absolute -left-16 bottom-0 h-64 w-64 rounded-full blur-3xl " +
            (isDark ? "bg-indigo-500/10" : "bg-indigo-300/25")
          }
        />
        <div
          className={
            "absolute left-1/2 top-[42%] h-96 w-96 -translate-x-1/2 rounded-full blur-3xl " +
            (isDark ? "bg-primary/10" : "bg-blue-300/15")
          }
        />
      </div>

      <div className="container-shell grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <div className="hero-enter-left max-w-xl lg:max-w-none [animation:hero-fade-up_0.7s_ease-out_both]">
          <span className="eyebrow">To&apos;g&apos;ri universitet, to&apos;g&apos;ri kelajak</span>

          <h1
            className={
              "responsive-heading-xl mt-5 overflow-visible leading-[1.12] sm:mt-6 " +
              (isDark ? "text-white" : "text-slate-950")
            }
          >
            Eng yaxshi universitetni haqiqiy talabalar tajribasi orqali{" "}
            <span className="inline-block overflow-visible py-1">
              <HeroRotatingText words={headlineWords} className="font-black" />
            </span>
          </h1>

          <p
            className={
              "responsive-prose mt-4 max-w-xl text-base leading-relaxed sm:mt-5 sm:text-lg " +
              (isDark ? "text-slate-300" : "text-slate-600")
            }
          >
            Universitetlarni solishtiring, moderatsiyadan o&apos;tgan sharhlarni o&apos;qing va
            qaroringizni real talaba fikri asosida qabul qiling.
          </p>

          <HeroSearchBar className="mt-8" isDark={isDark} />

          <HeroTrustStrip isDark={isDark} reviewCount={platformStats?.review_count} />

          <HeroStatsGrid stats={heroStats} isLoading={isStatsLoading} isDark={isDark} />
        </div>

        <div className="hero-enter-right mx-auto w-full max-w-md lg:max-w-none [animation:hero-fade-scale_0.7s_ease-out_0.15s_both]">
          <HeroPreviewPanel
            isDark={isDark}
            universityCaption={universityCaption}
            footerStat={footerStat}
          />
        </div>
      </div>
    </section>
  );
}
