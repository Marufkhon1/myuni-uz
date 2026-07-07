import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard.js";
import EmptyState from "../ui/EmptyState.jsx";
import {
  buildLeaderUniversityContext,
  buildPopularReviewStats,
} from "@/utils/popularReviewStats.js";
import PopularInsightsSidebar from "./popular/PopularInsightsSidebar.jsx";
import PopularReviewsToolbar from "./popular/PopularReviewsToolbar.jsx";
import PopularReviewCard from "./popular/PopularReviewCard.jsx";

const DEFAULT_SORT_ID = "likes";

function sortReviews(list, sortId) {
  const items = [...list];
  switch (sortId) {
    case "rating":
      return items.sort(
        (a, b) => b.rating - a.rating || (b.like_count ?? 0) - (a.like_count ?? 0)
      );
    case "newest":
      return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    default:
      return items.sort(
        (a, b) => (b.like_count ?? 0) - (a.like_count ?? 0) || new Date(b.created_at) - new Date(a.created_at)
      );
  }
}

export default function PopularReviewsSection({ popularReviews, onLike }) {
  const { changeSection, isStudent, openReviewUniversityFromPopular } = useDashboard();
  const [sortId, setSortId] = useState(DEFAULT_SORT_ID);
  const [ratingFilter, setRatingFilter] = useState("all");

  const stats = useMemo(() => buildPopularReviewStats(popularReviews), [popularReviews]);

  const filteredReviews = useMemo(() => {
    let list = popularReviews;

    if (ratingFilter !== "all") {
      const star = Number(ratingFilter);
      list = list.filter((item) => item.rating === star);
    }

    return sortReviews(list, sortId);
  }, [popularReviews, sortId, ratingFilter]);

  const leaderReview = useMemo(
    () => filteredReviews[0] ?? null,
    [filteredReviews]
  );

  const leaderContext = useMemo(
    () => buildLeaderUniversityContext(popularReviews, leaderReview, sortId),
    [popularReviews, leaderReview, sortId]
  );

  const topReview = useMemo(
    () => sortReviews(popularReviews, "likes")[0] ?? null,
    [popularReviews]
  );

  const showFeaturedLeader =
    filteredReviews.length > 0 &&
    sortId === DEFAULT_SORT_ID &&
    ratingFilter === "all" &&
    filteredReviews[0]?.id === topReview?.id;

  const showClearFilters = ratingFilter !== "all" || sortId !== DEFAULT_SORT_ID;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl">
      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-6">
        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <PopularInsightsSidebar
            isStudent={isStudent}
            stats={stats}
            leaderContext={leaderContext}
            sortId={sortId}
            onOpenUniversity={openReviewUniversityFromPopular}
          />
        </aside>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-white/12 dark:bg-slate-800/30">
          <header className="border-b border-slate-100 px-4 py-4 dark:border-white/10 sm:px-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Talabalar reytingi
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white sm:text-xl">
              Eng mashhur sharhlar
            </h3>
            {stats.count > 0 && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {stats.count} ta sharh · o&apos;rtacha {stats.averageRating ?? "—"}/5 · {stats.totalLikes}{" "}
                foydali
              </p>
            )}
          </header>

          {popularReviews.length > 0 && (
            <PopularReviewsToolbar
              sortId={sortId}
              onSortChange={setSortId}
              ratingFilter={ratingFilter}
              onRatingFilterChange={setRatingFilter}
              filteredCount={filteredReviews.length}
              totalCount={popularReviews.length}
              showClearFilters={showClearFilters}
            />
          )}

          <div className="space-y-3 p-4 sm:p-5">
            {popularReviews.length === 0 ? (
              <EmptyState
                variant="popular"
                title="Hali mashhur sharh yo'q"
                description="Birinchi sharhlar paydo bo'lgach, eng ko'p yoqqanlar shu yerda chiqadi."
                action={{
                  label: isStudent ? "Birinchi sharhni yozish" : "Sharhlarni ko'rish",
                  onClick: () => changeSection("reviews"),
                }}
              />
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                compact
                variant="filter"
                title="Mos sharh topilmadi"
                description="Boshqa filtr yoki saralashni tanlab ko'ring."
                action={{
                  label: "Filtrlarni tozalash",
                  onClick: () => {
                    setSortId(DEFAULT_SORT_ID);
                    setRatingFilter("all");
                  },
                }}
              />
            ) : (
              <ul className="space-y-4" aria-label="Mashhur sharhlar">
                {filteredReviews.map((item, index) => {
                  const rank = index + 1;
                  const isFeatured = showFeaturedLeader && rank === 1;
                  return (
                    <li key={item.id}>
                      <PopularReviewCard
                        item={item}
                        rank={isFeatured ? undefined : rank}
                        featured={isFeatured}
                        onLike={onLike}
                        onOpenUniversity={openReviewUniversityFromPopular}
                        showStudentVoiceBadge={!isStudent}
                        defaultExpanded={isFeatured}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
