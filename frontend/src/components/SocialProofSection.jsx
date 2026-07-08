import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "./dashboard/UserAvatar.jsx";
import Skeleton from "./ui/Skeleton.jsx";
import { FractionalStars } from "./ui/StarRatingDisplay.jsx";
import { getPublicPlatformStats, getPublicTopUniversityReviews } from "../services/publicService.js";
import { buildSocialProofHighlights, excerptReviewText } from "../utils/landingStats.js";
import { resolveMediaUrl } from "../utils/media.js";

function SocialProofCard({ review }) {
  const quote = excerptReviewText(review.text, 180);
  const universityLabel = review.university?.short_name || review.university?.name;
  const helpfulCount = review.helpful_count ?? review.like_count ?? 0;

  return (
    <article className="flex h-full min-h-[15.5rem] flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/90">
      <div className="flex shrink-0 items-start gap-3">
        <UserAvatar
          name={review.author}
          userId={review.author_id}
          avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-slate-950 dark:text-white">{review.author}</p>
          {universityLabel ? (
            <p className="mt-1 truncate text-xs font-bold text-primary">{universityLabel}</p>
          ) : null}
        </div>
        {helpfulCount > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black tabular-nums text-primary dark:bg-blue-400/12 dark:text-blue-300">
            <span aria-hidden="true">♥</span>
            {helpfulCount}
          </span>
        ) : null}
      </div>

      <p className="mt-4 flex-1 line-clamp-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <FractionalStars
            rating={review.rating}
            starClassName="text-xs"
            filledStarClassName="text-amber-400"
            emptyStarClassName="text-amber-200/90 dark:text-amber-500/25"
          />
          <span className="text-xs font-black tabular-nums text-slate-500 dark:text-slate-400">
            {review.rating}/5
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          Top sharh
        </span>
      </div>
    </article>
  );
}

function SocialProofSkeleton() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Ijtimoiy isbot yuklanmoqda">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-[15.5rem] rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.06]"
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
          getPublicTopUniversityReviews(3),
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
  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((left, right) => {
        const leftLikes = left.helpful_count ?? left.like_count ?? 0;
        const rightLikes = right.helpful_count ?? right.like_count ?? 0;
        return rightLikes - leftLikes;
      }),
    [reviews]
  );

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
              Real talabalar fikri — bazadan.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Top universitetlarning eng foydali deb topilgan sharhlari. «Kampus ovozi» belgisi
              chat a&apos;zoligini bildiradi — rasmiy OTM tasdiqi emas.{" "}
              <Link
                to="/ishonch-xavfsizlik"
                className="font-bold text-primary underline-offset-2 hover:underline"
              >
                Ishonch qoidalari
              </Link>
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

        {!isLoading && sortedReviews.length > 0 && (
          <div className="mt-10 responsive-card-grid">
            {sortedReviews.map((review) => (
              <SocialProofCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {!isLoading && sortedReviews.length === 0 && highlights.length > 0 && (
          <p className="mt-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Birinchi sharhlar paydo bo&apos;lgach, top universitetlar bo&apos;yicha eng foydalilari shu yerda chiqadi.
          </p>
        )}
      </div>
    </section>
  );
}
