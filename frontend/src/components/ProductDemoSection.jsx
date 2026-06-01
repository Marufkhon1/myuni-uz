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

const SCENE_DURATION_MS = 7000;
const DEMO_CHAT_MESSAGE_LIMIT = 6;

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

const scenes = [
  {
    id: "browse",
    label: "Universitetlarni ko'rish",
    caption: "Reyting, joylashuv va sharhlar bir joyda",
  },
  {
    id: "reviews",
    label: "Sharhlarni o'qish",
    caption: "Talabalar tajribasi bo'yicha baholash",
  },
  {
    id: "compare",
    label: "OTMlarni taqqoslash",
    caption: "Ikki universitetni yonma-yon solishtirish",
  },
  {
    id: "chat",
    label: "Chatda savol berish",
    caption: "Guruh chatidagi haqiqiy xabarlar",
  },
];

function DemoEmptyState({ title, description }) {
  return (
    <div className="grid h-full min-h-[220px] place-items-center rounded-[1.5rem] border border-dashed border-slate-200 bg-white/80 p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <div className="max-w-xs">
        <p className="font-black text-slate-950 dark:text-white">{title}</p>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function DemoBrowserChrome({ activeScene, children, isLoading }) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-glow dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-2 flex-1 truncate rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          myuni.uz — {activeScene.label}
        </div>
      </div>

      <div className="relative h-[min(400px,52vh)] min-h-[280px] overflow-hidden bg-[#f5f7fb] px-4 pt-4 pb-7 sm:px-5 sm:pt-5 sm:pb-8 dark:bg-slate-950">
        {isLoading ? (
          <div className="absolute inset-x-4 top-4 bottom-7 space-y-3 sm:inset-x-5 sm:top-5 sm:bottom-8">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-x-4 top-4 bottom-7 sm:inset-x-5 sm:top-5 sm:bottom-8"
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
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.06]">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Universitetlar</p>
        <p className="mt-1 text-base font-black text-slate-950 dark:text-white">Reyting va sharhlar</p>
      </div>
      {universities.map((university, index) => (
        <motion.div
          key={university.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.12, duration: 0.35 }}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.06]"
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
                showNumeric
                className="justify-end"
                starClassName="text-sm"
                numericClassName="text-sm font-black text-amber-500"
              />
            ) : (
              <p className="text-sm font-black text-amber-500" role="img" aria-label="Baho berilmagan">
                ★ —
              </p>
            )}
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
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

  const quote = excerptReviewText(review.text, 260);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.06] sm:p-5">
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 pb-3.5 dark:border-white/10 sm:gap-4 sm:pb-4">
        <UserAvatar
          name={review.author}
          avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950 dark:text-white">{review.author}</p>
          <p className="mt-0.5 truncate text-xs font-bold text-primary">
            {review.university?.short_name || review.university?.name}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-1 py-4 sm:px-3 sm:py-5">
        <p className="max-w-md text-center text-xs leading-7 text-slate-600 sm:text-sm sm:leading-7 dark:text-slate-300">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 dark:border-white/10 sm:pt-4">
        <StarRatingDisplay rating={review.rating} starClassName="text-base sm:text-lg" showNumeric={false} />
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
          Tasdiqlangan sharh
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
        description="Kamida ikkita universitet va sharhlar bo'lganda taqqoslash ko'rsatiladi."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-4 py-1">
      <p className="text-center text-sm font-black uppercase tracking-[0.16em] text-slate-500">Taqqoslash</p>
      <div className="grid grid-cols-2 gap-3">
        {universities.map((university) => (
          <div
            key={university.id}
            className="flex min-h-[9.5rem] flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.06]"
          >
            <p className="line-clamp-2 text-base font-black leading-snug text-slate-950 sm:text-lg dark:text-white">
              {university.short_name || university.name}
            </p>
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
              {university.location}
            </p>
            <div className="mt-auto pt-4">
              {formatLandingRating(university.average_rating) ? (
                <StarRatingDisplay
                  rating={Number(university.average_rating)}
                  starClassName="text-sm"
                  numericClassName="text-sm font-black text-amber-500"
                />
              ) : (
                <p className="text-sm font-black text-amber-500" role="img" aria-label="Baho berilmagan">
                  ★ —
                </p>
              )}
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {formatLandingStat(university.review_count)} sharh
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-primary/20 bg-blue-50/80 px-4 py-3 text-center text-sm font-bold leading-6 text-primary dark:bg-blue-400/10">
        Platformadagi haqiqiy reyting va sharh sonlari
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
    <div className="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06]">
      <div className="shrink-0 border-b border-slate-100 px-4 py-3.5 dark:border-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Guruh chat</p>
        <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{headerName}</p>
      </div>
      <div
        ref={listRef}
        className="demo-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="flex min-h-full flex-col justify-end gap-2.5 px-4 pb-4 pt-4">
          {visibleMessages.map((message, index) => {
            const fromApplicant = isApplicantMessage(message);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-[1.45] ${
                  fromApplicant
                    ? "ml-auto bg-primary/10 text-slate-800 ring-1 ring-primary/15 dark:bg-primary/20 dark:text-slate-100"
                    : "mr-auto bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                <p
                  className={`mb-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                    fromApplicant ? "text-primary" : "text-primary/80"
                  }`}
                >
                  {message.author}
                  {fromApplicant ? " · savol" : ""}
                </p>
                <p>{excerptReviewText(message.text, 180)}</p>
              </motion.div>
            );
          })}
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
    if (prefersReducedMotion || availableScenes.length <= 1 || isLoading) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSceneIndex((current) => {
        const currentId = scenes[current].id;
        const currentPos = availableScenes.indexOf(currentId);
        const nextPos = currentPos >= 0 ? (currentPos + 1) % availableScenes.length : 0;
        const nextId = availableScenes[nextPos];
        return scenes.findIndex((scene) => scene.id === nextId);
      });
    }, SCENE_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, availableScenes, isLoading]);

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
    <section id="demo" className="section-padding">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="eyebrow">Platforma demo</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            MyUni.uz qanday ko&apos;rinishda ishlaydi.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Bu yerda ko&apos;rsatilgan universitetlar, sharhlar va chat xabarlari bazadan olinadi —
            statik namuna emas.
          </p>

          <ol className="mt-8 space-y-3">
            {scenes.map((scene, index) => {
              const hasData = isLoading || availableScenes.includes(scene.id);
              const isActive = sceneIndex === index;

              return (
                <li key={scene.id}>
                  <button
                    type="button"
                    disabled={!hasData}
                    onClick={() => hasData && setSceneIndex(index)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                      isActive
                        ? "border-primary/40 bg-blue-50/70 shadow-soft dark:border-primary/35 dark:bg-blue-400/10"
                        : "border-slate-200 bg-white hover:border-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
                    } ${!hasData ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black ${
                        isActive
                          ? "bg-premium-gradient text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block font-black text-slate-950 dark:text-white">{scene.label}</span>
                      <span className="mt-0.5 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {scene.caption}
                        {!isLoading && !availableScenes.includes(scene.id) ? " · hozircha ma'lumot yo'q" : ""}
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
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-400/15 via-violet-400/10 to-transparent blur-2xl dark:from-blue-500/20 dark:via-violet-500/15" />
          <DemoBrowserChrome activeScene={activeScene} isLoading={isLoading}>
            {renderScene()}
          </DemoBrowserChrome>
          <p className="mt-5 text-center text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            {isLoading
              ? "Haqiqiy ma'lumotlar yuklanmoqda..."
              : prefersReducedMotion
                ? "Sahifani tanlang — animatsiya o'chirilgan."
                : availableScenes.length > 1
                  ? "Sahifalar avtomatik almashadi · bosib tanlash mumkin"
                  : "Jonli ma'lumotlar ko'rsatilmoqda"}
          </p>
        </div>
      </div>
    </section>
  );
}
