import { useEffect, useMemo, useState } from "react";
import UserAvatar from "./dashboard/UserAvatar.jsx";
import Skeleton from "./ui/Skeleton.jsx";
import { getPublicPlatformStats, getPublicRecentReviews } from "../services/publicService.js";
import { buildSocialProofHighlights, excerptReviewText } from "../utils/landingStats.js";
import { resolveMediaUrl } from "../utils/media.js";

function SocialProofCard({ review }) {
  const quote = excerptReviewText(review.text, 180);
  const universityLabel = review.university?.short_name || review.university?.name;

  return (
    <article className="social-proof-card flex h-[15.5rem] w-[min(88vw,22rem)] shrink-0 flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/90">
      <div className="flex shrink-0 items-start gap-3">
        <UserAvatar
          name={review.author}
          avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate font-black text-slate-950 dark:text-white">{review.author}</p>
          {universityLabel && (
            <p className="mt-1 truncate text-xs font-bold text-primary">{universityLabel}</p>
          )}
        </div>
      </div>
      <p className="mt-4 flex-1 line-clamp-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="mt-4 shrink-0 text-amber-400" aria-label={`${review.rating} yulduz`}>
        {"★".repeat(review.rating)}
        <span className="ml-2 text-xs font-black text-slate-400">{review.rating}/5</span>
      </p>
    </article>
  );
}

function SocialProofSkeleton() {
  return (
    <div className="mt-10 flex gap-4 overflow-hidden" aria-busy="true" aria-label="Ijtimoiy isbot yuklanmoqda">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="w-[min(88vw,22rem)] shrink-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.06]"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="mt-4 h-16 w-full" />
          <Skeleton className="mt-3 h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function SocialProofSection() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [statsData, reviewsData] = await Promise.all([
          getPublicPlatformStats(),
          getPublicRecentReviews(12),
        ]);
        if (isMounted) {
          setStats(statsData);
          setReviews(reviewsData);
        }
      } catch {
        if (isMounted) {
          setStats(null);
          setReviews([]);
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

  const highlights = useMemo(() => buildSocialProofHighlights(stats), [stats]);
  const carouselItems = reviews.length > 0 ? [...reviews, ...reviews] : [];

  if (!isLoading && highlights.length === 0 && reviews.length === 0) {
    return null;
  }

  return (
    <section id="social-proof" className="section-padding border-y border-slate-200/80 bg-white/60 dark:border-white/10 dark:bg-slate-950/40">
      <div className="container-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Hamjamiyat ishonchi</span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Real talabalar fikri — har kuni yangilanadi.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Platformadagi sharhlar tasdiqlangan foydalanuvchilardan keladi va moderatsiyadan o&apos;tadi.
            </p>
          </div>

          {!isLoading && highlights.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 lg:max-w-3xl lg:grid-cols-4">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {isLoading && <SocialProofSkeleton />}

        {!isLoading && reviews.length > 0 && (
          <div className="social-proof-marquee mt-10">
            <div className="social-proof-track">
              {carouselItems.map((review, index) => (
                <SocialProofCard key={`${review.id}-${index}`} review={review} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && reviews.length === 0 && highlights.length > 0 && (
          <p className="mt-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Birinchi sharhlar paydo bo&apos;lgach, ular shu yerda aylanma ko&apos;rinishda chiqadi.
          </p>
        )}
      </div>
    </section>
  );
}
