import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "./dashboard/UserAvatar.jsx";
import Skeleton from "./ui/Skeleton.jsx";
import { getPublicLandingPreview } from "../services/publicService.js";
import { excerptReviewText, formatLandingRating, formatLandingStat } from "../utils/landingStats.js";
import StarRatingDisplay from "./ui/StarRatingDisplay.jsx";
import { resolveMediaUrl } from "../utils/media.js";
import { scrollToLandingSection } from "../utils/landingScroll.js";

const SCENE_DURATION_MS = 7500;
const TOTAL_DEMO_SECONDS = 30;
const DEMO_CHAT_MESSAGE_LIMIT = 6;

const scenes = [
  {
    id: "browse",
    fig: "01",
    label: "Universitetlarni ko'rish",
    caption: "Reyting, joylashuv va sharhlar bir joyda",
    icon: "🔍",
  },
  {
    id: "reviews",
    fig: "02",
    label: "Sharhlarni o'qish",
    caption: "Talabalar tajribasi bo'yicha baholash",
    icon: "⭐",
  },
  {
    id: "compare",
    fig: "03",
    label: "OTMlarni taqqoslash",
    caption: "Uchta universitetni yonma-yon solishtirish",
    icon: "⚖️",
  },
  {
    id: "chat",
    fig: "04",
    label: "Chatda savol berish",
    caption: "Guruh chatidagi haqiqiy xabarlar",
    icon: "💬",
  },
];

function isApplicantMessage(message) {
  return message.author_role === "applicant";
}

function selectDemoChatMessages(messages, limit = DEMO_CHAT_MESSAGE_LIMIT) {
  if (messages.length <= limit) {
    return messages;
  }

  let lastQuestionIndex = -1;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (isApplicantMessage(messages[index])) {
      lastQuestionIndex = index;
      break;
    }
  }

  if (lastQuestionIndex >= 0) {
    const questionAndReplies = messages.slice(lastQuestionIndex);
    return questionAndReplies.length <= limit
      ? questionAndReplies
      : questionAndReplies.slice(0, limit);
  }

  return messages.slice(-limit);
}

function DemoEmptyState({ title, description }) {
  return (
    <div className="grid h-full min-h-[220px] place-items-center rounded-[1.5rem] border border-dashed border-slate-200/80 bg-white/90 p-8 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="max-w-xs">
        <p className="font-black text-slate-950 dark:text-white">{title}</p>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function DemoTimelineBar({
  sceneIndex,
  sceneProgress,
  availableScenes,
  onSelect,
  isPlaying,
  prefersReducedMotion,
}) {
  const activePosition = availableScenes.indexOf(scenes[sceneIndex]?.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Demo bosqichlari">
        {scenes.map((scene, index) => {
          const enabled = availableScenes.includes(scene.id);
          const isActive = sceneIndex === index;
          const scenePos = availableScenes.indexOf(scene.id);
          const isComplete = scenePos >= 0 && scenePos < activePosition;
          const fill = isComplete ? 100 : isActive ? sceneProgress : 0;

          return (
            <button
              key={scene.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={!enabled}
              onClick={() => enabled && onSelect(index)}
              className={`demo-timeline-segment group ${!enabled ? "cursor-not-allowed opacity-40" : ""}`}
              title={scene.label}
            >
              <div className="demo-timeline-fill" style={{ width: `${fill}%` }} />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="font-black text-slate-800 dark:text-white">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            FIG {scenes[sceneIndex]?.fig}
          </span>
          {scenes[sceneIndex]?.label}
        </p>
        <span className="shrink-0 font-bold tabular-nums text-slate-500 dark:text-slate-400">
          {prefersReducedMotion
            ? "Qo'lda tanlang"
            : isPlaying
              ? `${Math.min(TOTAL_DEMO_SECONDS, Math.round(((activePosition + sceneProgress / 100) / Math.max(availableScenes.length, 1)) * TOTAL_DEMO_SECONDS))} / ${TOTAL_DEMO_SECONDS}s`
              : "Pauza"}
        </span>
      </div>
    </div>
  );
}

function DemoBrowserChrome({ activeScene, children, isLoading, sceneProgress }) {
  return (
    <div className="demo-window">
      <div className="flex items-center gap-2 border-b border-slate-100/80 bg-slate-50/90 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/90 shadow-sm" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 shadow-sm" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
        <div className="ml-2 flex min-w-0 flex-1 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-slate-950/80">
            <span className="text-[10px]" aria-hidden="true">
              🔒
            </span>
            <span className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
              myuni.uz — {activeScene.label}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </div>

      <div className="demo-scene-progress mx-0 h-px rounded-none bg-slate-100 dark:bg-white/5">
        <div className="demo-scene-progress-fill h-px rounded-none" style={{ width: `${sceneProgress}%` }} />
      </div>

      <div className="demo-window-grid relative h-[min(440px,58vh)] min-h-[320px] overflow-hidden bg-[#f5f7fb]/90 px-4 pt-4 pb-6 sm:px-5 sm:pt-5 sm:pb-7 dark:bg-slate-950/90">
        {isLoading ? (
          <div className="absolute inset-x-4 top-4 bottom-6 space-y-3 sm:inset-x-5 sm:top-5 sm:bottom-7">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-4 top-4 bottom-6 sm:inset-x-5 sm:top-5 sm:bottom-7"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function BrowseScene({ universities }) {
  if (universities.length === 0) {
    return (
      <DemoEmptyState
        title="Hali universitet yo'q"
        description="Birinchi universitetlar qo'shilgach, ular shu yerda ko'rinadi."
      />
    );
  }

  return (
    <div className="demo-panel-scroll grid h-full min-h-0 gap-2.5 overflow-y-auto overscroll-contain pb-2 pr-1">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-blue-50 to-white p-3.5 shadow-sm dark:border-primary/25 dark:from-blue-400/10 dark:to-white/[0.04]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Katalog</p>
        <p className="mt-1 text-base font-black text-slate-950 dark:text-white">Reyting va sharhlar</p>
      </div>
      {universities.map((university, index) => (
        <motion.div
          key={university.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
          className={`flex items-center justify-between rounded-2xl border bg-white px-3.5 py-3 shadow-sm transition dark:bg-white/[0.06] ${
            index === 0
              ? "border-primary/35 ring-2 ring-primary/15"
              : "border-slate-200/90 dark:border-white/10"
          }`}
        >
          <div className="min-w-0 pr-3">
            <p className="truncate font-black text-slate-950 dark:text-white">
              {university.short_name || university.name}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{university.location}</p>
          </div>
          <div className="shrink-0 text-right">
            {formatLandingRating(university.average_rating) ? (
              <StarRatingDisplay
                rating={Number(university.average_rating)}
                variant="pill"
                showNumeric
                starClassName="text-[11px]"
                numericClassName="text-[10px] font-black text-amber-700 dark:text-amber-200"
              />
            ) : (
              <span className="text-xs font-bold text-slate-400">Baho yo&apos;q</span>
            )}
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              {formatLandingStat(university.review_count)} sharh
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ReviewsScene({ review }) {
  if (!review) {
    return (
      <DemoEmptyState
        title="Hali sharh yo'q"
        description="Talabalar birinchi sharhlarini qoldirgach, ular shu yerda ko'rinadi."
      />
    );
  }

  const quote = excerptReviewText(review.text, 220);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="pointer-events-none absolute -right-4 -top-6 select-none text-[5rem] leading-none text-primary/10">
        &ldquo;
      </div>

      <div className="shrink-0 border-b border-slate-100/80 px-4 pb-3.5 pt-4 dark:border-white/10 sm:px-5 sm:pb-4 sm:pt-5">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={review.author}
            avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-black text-slate-950 dark:text-white">{review.author}</p>
            <p className="mt-0.5 truncate text-xs font-bold text-primary">
              {review.university?.short_name || review.university?.name}
            </p>
          </div>
          <StarRatingDisplay
            rating={review.rating}
            variant="pill"
            showNumeric
            starClassName="text-xs"
            numericClassName="text-[10px] font-black text-amber-700 dark:text-amber-200"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center px-4 py-5 sm:px-6">
        <p className="text-sm leading-8 text-slate-700 dark:text-slate-200 sm:text-[0.95rem] sm:leading-8">
          {quote}
        </p>
      </div>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-slate-100/80 px-4 py-3.5 dark:border-white/10 sm:px-5">
        <StarRatingDisplay
          rating={review.rating}
          starClassName="text-base sm:text-lg"
          showNumeric
          numericClassName="ml-2 text-sm font-black text-slate-500 dark:text-slate-400"
        />
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
          ✓ Tasdiqlangan
        </span>
      </div>
    </div>
  );
}

function CompareScene({ universities }) {
  if (universities.length < 2) {
    return (
      <DemoEmptyState
        title="Taqqoslash uchun yetarli ma'lumot yo'q"
        description="Kamida uchta universitet va sharhlar bo'lganda taqqoslash ko'rsatiladi."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-4 py-2">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        Yonma-yon taqqoslash
      </p>
      <div className="relative grid grid-cols-2 gap-3">
        <span className="absolute left-1/2 top-1/2 z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-500 shadow-md dark:border-white/15 dark:bg-slate-900 dark:text-slate-300">
          VS
        </span>
        {universities.map((university, index) => (
          <motion.div
            key={university.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.45 }}
            className={`flex min-h-[10rem] flex-col rounded-2xl border bg-white p-4 shadow-sm dark:bg-white/[0.06] ${
              index === 0
                ? "border-primary/30 ring-1 ring-primary/15"
                : "border-slate-200/90 dark:border-white/10"
            }`}
          >
            <p className="line-clamp-2 text-sm font-black leading-snug text-slate-950 sm:text-base dark:text-white">
              {university.short_name || university.name}
            </p>
            <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-slate-500">
              {university.location}
            </p>
            <div className="mt-auto pt-4">
              {formatLandingRating(university.average_rating) ? (
                <StarRatingDisplay
                  rating={Number(university.average_rating)}
                  variant="pill"
                  showNumeric
                  starClassName="text-[11px]"
                  numericClassName="text-[10px] font-black text-amber-700 dark:text-amber-200"
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">—</span>
              )}
              <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                {formatLandingStat(university.review_count)} sharh
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChatScene({ messages, chatUniversity }) {
  const listRef = useRef(null);
  const visibleMessages = selectDemoChatMessages(messages);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [visibleMessages]);

  if (messages.length === 0) {
    return (
      <DemoEmptyState
        title="Hali chat xabari yo'q"
        description="Foydalanuvchilar chatda yozishni boshlagach, xabarlar shu yerda ko'rinadi."
      />
    );
  }

  const headerName = chatUniversity?.short_name || chatUniversity?.name || "Universitet chat";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="shrink-0 border-b border-slate-100/80 bg-slate-50/80 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Guruh chat</p>
        <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{headerName}</p>
      </div>
      <div ref={listRef} className="demo-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#eef2f8]/50 dark:bg-slate-950/40">
        <div className="flex min-h-full flex-col justify-end gap-2.5 px-4 pb-4 pt-4">
          {visibleMessages.map((message, index) => {
            const fromApplicant = isApplicantMessage(message);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.07, duration: 0.35 }}
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                  fromApplicant
                    ? "ml-auto bg-primary text-white"
                    : "mr-auto border border-slate-200/80 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-200"
                }`}
              >
                <p
                  className={`mb-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                    fromApplicant ? "text-blue-100" : "text-primary"
                  }`}
                >
                  {message.author}
                </p>
                <p>{excerptReviewText(message.text, 180)}</p>
              </motion.div>
            );
          })}
          <div className="mr-auto flex items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/80 dark:bg-white/[0.06] dark:ring-white/10">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDemoSection() {
  const prefersReducedMotion = useReducedMotion();
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const activeScene = scenes[sceneIndex];

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPublicLandingPreview();
        if (isMounted) {
          setPreview(data);
        }
      } catch {
        if (isMounted) {
          setPreview(null);
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

  const availableScenes = useMemo(() => {
    if (!preview) {
      return [];
    }

    const ids = [];
    if (preview.universities?.length > 0) {
      ids.push("browse");
    }
    if (preview.featured_review) {
      ids.push("reviews");
    }
    if (preview.compare_universities?.length >= 2) {
      ids.push("compare");
    }
    if (preview.chat_messages?.length > 0) {
      ids.push("chat");
    }
    return ids;
  }, [preview]);

  useEffect(() => {
    if (availableScenes.length === 0) {
      return;
    }
    if (!availableScenes.includes(activeScene.id)) {
      const nextIndex = scenes.findIndex((scene) => availableScenes.includes(scene.id));
      if (nextIndex >= 0) {
        setSceneIndex(nextIndex);
      }
    }
  }, [availableScenes, activeScene.id]);

  useEffect(() => {
    setSceneProgress(0);
  }, [sceneIndex]);

  useEffect(() => {
    if (prefersReducedMotion || availableScenes.length <= 1 || isLoading || !isPlaying) {
      return undefined;
    }

    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setSceneProgress(Math.min(100, (elapsed / SCENE_DURATION_MS) * 100));
    }, 60);

    const sceneTimer = window.setInterval(() => {
      setSceneIndex((current) => {
        const currentId = scenes[current].id;
        const currentPos = availableScenes.indexOf(currentId);
        const nextPos = currentPos >= 0 ? (currentPos + 1) % availableScenes.length : 0;
        const nextId = availableScenes[nextPos];
        return scenes.findIndex((scene) => scene.id === nextId);
      });
      setSceneProgress(0);
    }, SCENE_DURATION_MS);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(sceneTimer);
    };
  }, [prefersReducedMotion, availableScenes, isLoading, isPlaying, sceneIndex]);

  function handleSceneSelect(index) {
    setSceneIndex(index);
    setSceneProgress(0);
  }

  function renderScene() {
    if (!preview) {
      return (
        <DemoEmptyState
          title="Ma'lumot yuklanmadi"
          description="Platforma ma'lumotlarini hozircha ko'rsatib bo'lmadi. Keyinroq qayta urinib ko'ring."
        />
      );
    }

    switch (activeScene.id) {
      case "browse":
        return <BrowseScene universities={preview.universities ?? []} />;
      case "reviews":
        return <ReviewsScene review={preview.featured_review} />;
      case "compare":
        return <CompareScene universities={preview.compare_universities ?? []} />;
      case "chat":
        return (
          <ChatScene
            messages={preview.chat_messages ?? []}
            chatUniversity={preview.chat_university}
          />
        );
      default:
        return null;
    }
  }

  return (
    <section id="demo" className="section-padding relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-500/[0.06] to-transparent dark:from-blue-500/10" />

      <div className="container-shell grid items-center gap-12 xl:grid-cols-[0.92fr_1.08fr] xl:gap-16">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">Platforma demo</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white dark:bg-white dark:text-slate-950">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Jonli ma&apos;lumot
            </span>
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] dark:text-white">
            Platforma o&apos;zi gapiradi —{" "}
            <span className="bg-gradient-to-r from-primary via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              30 soniyada
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Video o&apos;rniga haqiqiy interfeys — universitetlar, sharhlar va chat xabarlari
            to&apos;g&apos;ridan-to&apos;g&apos;ri bazadan keladi. Statik screenshot emas.
          </p>

          <ol className="relative mt-10 space-y-2">
            <span className="demo-step-rail hidden sm:block" aria-hidden="true" />
            {scenes.map((scene, index) => {
              const hasData = isLoading || availableScenes.includes(scene.id);
              const isActive = sceneIndex === index;

              return (
                <li key={scene.id}>
                  <button
                    type="button"
                    disabled={!hasData}
                    onClick={() => hasData && handleSceneSelect(index)}
                    className={`relative flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-primary/35 bg-white shadow-[0_12px_40px_-20px_rgba(37,99,235,0.45)] dark:bg-white/[0.06]"
                        : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white dark:bg-white/[0.03] dark:hover:border-white/10"
                    } ${!hasData ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span
                      className={`relative z-[1] grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl text-sm ${
                        isActive
                          ? "bg-premium-gradient text-white shadow-glow"
                          : "bg-slate-100 text-lg dark:bg-white/10"
                      }`}
                    >
                      {isActive && isPlaying && !prefersReducedMotion ? (
                        <>
                          <span
                            className="absolute inset-x-0 bottom-0 bg-white/25 transition-all duration-100 ease-linear"
                            style={{ height: `${sceneProgress}%` }}
                            aria-hidden="true"
                          />
                          <span className="relative text-xs font-black">{scene.fig}</span>
                        </>
                      ) : (
                        <span aria-hidden="true">{scene.icon}</span>
                      )}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-950 dark:text-white">{scene.label}</span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          FIG {scene.fig}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {scene.caption}
                        {!isLoading && !availableScenes.includes(scene.id) ? " · hozircha yo'q" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="landing-btn-gradient px-7 py-4 text-center text-base">
              Bepul boshlash
            </Link>
            <a
              href="#universities"
              className="landing-btn-outline px-7 py-4 text-center text-base"
              onClick={(event) => {
                event.preventDefault();
                scrollToLandingSection("#universities");
                window.history.replaceState(null, "", "#universities");
              }}
            >
              Universitetlarni ko&apos;rish
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="demo-stage p-3 sm:p-4">
            <div className="demo-stage-glow" aria-hidden="true" />
            <div className="demo-device-shell relative">
              <div className="demo-device-notch" aria-hidden="true" />
              <DemoBrowserChrome
                activeScene={activeScene}
                isLoading={isLoading}
                sceneProgress={sceneProgress}
              >
                {renderScene()}
              </DemoBrowserChrome>
            </div>

            <div className="relative mt-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80">
              <div className="mb-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying((value) => !value)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-950 dark:hover:bg-primary dark:hover:text-white"
                  aria-pressed={isPlaying}
                >
                  <span aria-hidden="true">{isPlaying ? "⏸" : "▶"}</span>
                  {isPlaying ? "Pauza" : "Davom etish"}
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {availableScenes.length} ta jonli sahna
                </span>
              </div>
              <DemoTimelineBar
                sceneIndex={sceneIndex}
                sceneProgress={sceneProgress}
                availableScenes={availableScenes}
                onSelect={handleSceneSelect}
                isPlaying={isPlaying}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
            {isLoading
              ? "Haqiqiy ma'lumotlar yuklanmoqda..."
              : prefersReducedMotion
                ? "Animatsiya o'chirilgan — qadamni tanlang."
                : isPlaying
                  ? "Avtomatik aylanadi · timeline ustiga bosing"
                  : "Pauza rejimi — qadamni tanlang"}
          </p>
        </div>
      </div>
    </section>
  );
}
