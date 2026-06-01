import { useMemo, useState } from "react";
import EmptyState from "../ui/EmptyState.jsx";
import ReviewCard from "./ReviewCard.jsx";
import UserAvatar from "./UserAvatar.jsx";
import { resolveMediaUrl } from "../../utils/media.js";
import {
  ReviewFeedControls,
  buildReviewFeedSummary,
} from "../reviews/ReviewFeedControls.jsx";

const SORT_OPTIONS = [
  { id: "likes", label: "Eng ko'p like" },
  { id: "rating", label: "Eng yuqori baho" },
  { id: "newest", label: "Eng yangi" },
];

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

function StatChip({ label, value, highlight = false, compact = false }) {
  return (
    <div
      className={`rounded-2xl border ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      } ${
        highlight
          ? "border-primary/20 bg-blue-50/90 dark:border-primary/25 dark:bg-blue-400/10"
          : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-0.5 font-black leading-none ${
          compact ? "text-sm" : "mt-1 text-base"
        } ${highlight ? "text-primary dark:text-blue-200" : "text-slate-800 dark:text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

function PopularInsightsSidebar({ isStudent, stats, topReview, onOpenSection, compact = false }) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col rounded-[1.35rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] ${
        compact ? "p-3 sm:p-3.5" : "p-3.5 sm:p-4"
      }`}
    >
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Mashhur sharhlar</p>
        <h2
          className={`mt-1 font-black leading-snug text-slate-950 dark:text-white ${
            compact ? "text-lg" : "mt-1.5 text-xl"
          }`}
        >
          Eng ko&apos;p yoqqanlar
        </h2>
        {!compact && (
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {isStudent
              ? "Like yig'gan sharhlarni o'qing va qo'llab-quvvatlang."
              : "Tanlov uchun talabalar eng ishonchli deb topgan sharhlar."}
          </p>
        )}
      </div>

      <div className={`grid grid-cols-2 gap-2 ${compact ? "mt-3" : "mt-4 gap-2.5"}`}>
        <StatChip label="Sharhlar" value={stats.count} compact={compact} />
        <StatChip label="Like jami" value={stats.totalLikes} highlight compact={compact} />
        <StatChip
          label="O'rtacha baho"
          value={stats.averageRating != null ? `${stats.averageRating}/5` : "—"}
          compact={compact}
        />
        <StatChip label="OTM lar" value={stats.universityCount} compact={compact} />
      </div>

      {topReview && (
        <div
          className={`rounded-2xl border border-primary/15 bg-blue-50/50 dark:border-primary/25 dark:bg-blue-400/10 ${
            compact ? "mt-3 p-3" : "mt-4 p-3.5"
          }`}
        >
          <p className="text-[11px] font-black uppercase tracking-wide text-primary">Hozirgi lider</p>
          <div className="mt-2 flex items-center gap-3">
            <UserAvatar
              name={topReview.author}
              avatarUrl={resolveMediaUrl(topReview.author_avatar_url || "")}
              size={compact ? "sm" : "md"}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">{topReview.author}</p>
              <p className="text-xs font-bold text-primary">
                ♥ {topReview.like_count ?? 0} · {topReview.rating}/5
              </p>
            </div>
          </div>
        </div>
      )}

      {onOpenSection && !compact && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-white/10">
          <button type="button" onClick={() => onOpenSection("reviews")} className="btn-modal-dark w-full">
            {isStudent ? "Sharh yozish" : "Barcha sharhlarni ko'rish"}
          </button>
          <button type="button" onClick={() => onOpenSection("compare")} className="btn-modal-outline w-full">
            OTMlarni taqqoslash
          </button>
        </div>
      )}
    </div>
  );
}

export default function PopularReviewsSection({
  popularReviews,
  onLike,
  onOpenSection,
  onOpenUniversity,
  isStudent = false,
}) {
  const [sortId, setSortId] = useState(DEFAULT_SORT_ID);
  const [ratingFilter, setRatingFilter] = useState("all");

  const stats = useMemo(() => {
    const totalLikes = popularReviews.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
    const averageRating =
      popularReviews.length > 0
        ? (
            popularReviews.reduce((sum, item) => sum + (item.rating ?? 0), 0) / popularReviews.length
          ).toFixed(1)
        : null;

    const universityIds = new Set(
      popularReviews.map((review) => review.university?.id).filter(Boolean)
    );

    return {
      count: popularReviews.length,
      totalLikes,
      averageRating,
      universityCount: universityIds.size,
    };
  }, [popularReviews]);

  const filteredReviews = useMemo(() => {
    let list = popularReviews;

    if (ratingFilter !== "all") {
      const star = Number(ratingFilter);
      list = list.filter((item) => item.rating === star);
    }

    return sortReviews(list, sortId);
  }, [popularReviews, sortId, ratingFilter]);

  const topReview = useMemo(
    () => sortReviews(popularReviews, "likes")[0] ?? null,
    [popularReviews]
  );

  function clearAllFilters() {
    setSortId(DEFAULT_SORT_ID);
    setRatingFilter("all");
  }

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.id === sortId)?.label ?? SORT_OPTIONS[0].label;
  const feedSummary =
    popularReviews.length > 0
      ? buildReviewFeedSummary({
          filteredCount: filteredReviews.length,
          totalCount: popularReviews.length,
          ratingFilter,
          sortLabel: activeSortLabel,
        })
      : "";

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl">
      <section className="grid grid-cols-1 items-start gap-4 md:gap-5 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-6">
        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <div className="lg:hidden">
            <PopularInsightsSidebar
              isStudent={isStudent}
              stats={stats}
              topReview={topReview}
              onOpenSection={onOpenSection}
              compact
            />
          </div>

          <div className="hidden lg:block">
            <PopularInsightsSidebar
              isStudent={isStudent}
              stats={stats}
              topReview={topReview}
              onOpenSection={onOpenSection}
            />
          </div>
        </aside>

        <div className="min-w-0 w-full rounded-[1.35rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
          <div className="border-b border-slate-100 px-4 py-4 dark:border-white/10 sm:px-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                    Sharhlar ro&apos;yxati
                  </p>
                  <h3 className="mt-0.5 text-xl font-black uppercase tracking-[0.08em] text-slate-950 dark:text-white sm:text-2xl">
                    TOP MASHHUR SHARHLAR
                  </h3>
                  {popularReviews.length > 0 && (
                    <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{feedSummary}</p>
                  )}
                </div>

                {popularReviews.length > 0 && (
                  <span className="inline-flex w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {filteredReviews.length}
                    {filteredReviews.length !== popularReviews.length ? ` / ${popularReviews.length}` : ""} ta
                  </span>
                )}
              </div>

              {popularReviews.length > 0 && (
                <ReviewFeedControls
                  sortOptions={SORT_OPTIONS}
                  sortId={sortId}
                  onSortChange={setSortId}
                  ratingFilter={ratingFilter}
                  onRatingFilterChange={setRatingFilter}
                />
              )}
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {popularReviews.length === 0 ? (
              <EmptyState
                variant="popular"
                title="Hali mashhur sharh yo'q"
                description="Birinchi sharhlar paydo bo'lgach, eng ko'p yoqqanlar shu yerda chiqadi."
                action={
                  onOpenSection
                    ? {
                        label: isStudent ? "Birinchi sharhni yozish" : "Sharhlarni ko'rish",
                        onClick: () => onOpenSection("reviews"),
                      }
                    : undefined
                }
              />
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                compact
                variant="filter"
                title="Mos sharh topilmadi"
                description="Filtr yoki saralashni o'zgartiring yoki tozalang."
                action={{
                  label: "Filtrni tozalash",
                  onClick: clearAllFilters,
                }}
              />
            ) : (
              <ul className="space-y-4">
                {filteredReviews.map((item, index) => (
                  <li key={item.id} className="min-w-0">
                    <ReviewCard
                      item={item}
                      showUniversity
                      onLike={onLike}
                      onOpenUniversity={onOpenUniversity}
                      elevated
                      popularRank={index + 1}
                      showStudentVoiceBadge={!isStudent}
                      likeLabel="Foydali"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
