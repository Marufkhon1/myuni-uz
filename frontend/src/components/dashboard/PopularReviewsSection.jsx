import { useMemo, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UserAvatar from "./UserAvatar.jsx";
import ReviewCard from "./ReviewCard.jsx";
import { resolveMediaUrl } from "../../utils/media.js";

const SORT_OPTIONS = [
  { id: "likes", label: "Eng ko'p like", icon: "♥" },
  { id: "rating", label: "Eng yuqori baho", icon: "★" },
  { id: "newest", label: "Eng yangi", icon: "↓" },
];

function StatChip({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        highlight
          ? "border-primary/20 bg-blue-50/90 dark:border-primary/25 dark:bg-blue-400/10"
          : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-1 text-base font-black leading-none ${
          highlight ? "text-primary dark:text-blue-200" : "text-slate-800 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SortToggleGroup({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Saralash"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-1 dark:border-white/10 dark:bg-white/[0.04]"
    >
      {SORT_OPTIONS.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${
              isActive
                ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/80 dark:bg-white/10 dark:text-blue-200 dark:ring-white/10"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <span aria-hidden="true" className="text-[11px] leading-none">
              {option.icon}
            </span>
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

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

function FeaturedReviewHero({ item, onLike, onOpenUniversity }) {
  const dateLabel = new Date(item.created_at).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="relative overflow-hidden rounded-[1.35rem] border border-primary/25 bg-gradient-to-br from-blue-50/95 via-white to-violet-50/40 p-5 shadow-soft dark:border-primary/30 dark:from-blue-400/10 dark:via-white/[0.06] dark:to-violet-400/5 sm:p-6">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
          #1 mashhur
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-primary shadow-sm dark:bg-white/10 dark:text-blue-200">
          ♥ {item.like_count ?? 0}
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <UserAvatar
          name={item.author}
          avatarUrl={resolveMediaUrl(item.author_avatar_url || "")}
          size="lg"
        />
        <div className="min-w-0 flex-1 pt-12 sm:pt-0 sm:pr-24">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Lider sharh</p>
          <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{item.author}</h3>
          {item.university?.name && (
            <button
              type="button"
              onClick={() => onOpenUniversity?.(item.university.id)}
              className="mt-1 flex items-center gap-2 text-left text-sm font-bold text-primary hover:underline"
            >
              <UniversityAvatar university={item.university} size="sm" />
              {item.university.name}
            </button>
          )}
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{dateLabel}</p>
          <p className="mt-2 text-amber-400">
            {"★".repeat(item.rating)}
            <span className="ml-2 text-sm font-black text-slate-600 dark:text-slate-300">{item.rating}/5</span>
          </p>
          <p className="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">{item.text}</p>
          <button
            type="button"
            onClick={() => onLike(item.id)}
            className={`mt-4 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-black transition ${
              item.liked_by_me
                ? "border-primary/30 bg-primary text-white shadow-glow"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
            }`}
          >
            <span aria-hidden="true">{item.liked_by_me ? "♥" : "♡"}</span>
            Yoqdi ({item.like_count ?? 0})
          </button>
        </div>
      </div>
    </article>
  );
}

function PopularInsightsSidebar({ isStudent, stats, topReview, onOpenSection }) {
  return (
    <div className="flex h-fit w-full flex-col self-start rounded-[2rem] border border-slate-200 bg-white p-3.5 shadow-soft sm:p-4 dark:border-white/10 dark:bg-white/[0.06]">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Mashhur sharhlar</p>
        <h2 className="mt-1.5 text-xl font-black leading-snug text-slate-950 dark:text-white">
          Eng ko&apos;p yoqqanlar
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {isStudent
            ? "Like yig'gan sharhlarni o'qing va qo'llab-quvvatlang."
            : "Tanlov uchun talabalar eng ishonchli deb topgan sharhlar."}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <StatChip label="Sharhlar" value={stats.count} />
        <StatChip label="Like jami" value={stats.totalLikes} highlight />
        <StatChip
          label="O'rtacha baho"
          value={stats.averageRating != null ? `${stats.averageRating}/5` : "—"}
        />
        <StatChip label="OTM lar" value={stats.universityCount} />
      </div>

      {topReview && (
        <div className="mt-4 rounded-2xl border border-primary/15 bg-blue-50/50 p-3.5 dark:border-primary/25 dark:bg-blue-400/10">
          <p className="text-[11px] font-black uppercase tracking-wide text-primary">Hozirgi lider</p>
          <div className="mt-2 flex items-center gap-3">
            <UserAvatar
              name={topReview.author}
              avatarUrl={resolveMediaUrl(topReview.author_avatar_url || "")}
              size="md"
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

      {onOpenSection && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={() => onOpenSection("reviews")}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-950 dark:hover:bg-primary dark:hover:text-white"
          >
            {isStudent ? "Sharh yozish" : "Barcha sharhlarni ko'rish"}
          </button>
          <button
            type="button"
            onClick={() => onOpenSection("compare")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:text-slate-200"
          >
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
  const [sortId, setSortId] = useState("likes");
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
  const featuredReview = filteredReviews[0] ?? null;
  const otherReviews = filteredReviews.slice(1);

  return (
    <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[minmax(280px,18rem)_1fr]">
      <PopularInsightsSidebar
        isStudent={isStudent}
        stats={stats}
        topReview={topReview}
        onOpenSection={onOpenSection}
      />

      <div className="flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] lg:max-h-[calc(100dvh-11rem)] lg:flex">
        <div className="shrink-0 border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Sharhlar ro&apos;yxati</p>
                <h3 className="mt-0.5 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
                  Top {filteredReviews.length} mashhur sharh
                </h3>
              </div>
              {popularReviews.length > 0 && (
                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {filteredReviews.length}
                  {filteredReviews.length !== popularReviews.length ? ` / ${popularReviews.length}` : ""} ta
                </span>
              )}
            </div>

            {popularReviews.length > 0 && (
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Saralash</p>
                  <SortToggleGroup value={sortId} onChange={setSortId} />
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Baho bo&apos;yicha</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "5", "4", "3", "2", "1"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRatingFilter(value)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                          ratingFilter === value
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                        }`}
                      >
                        {value === "all" ? "Hammasi" : `${value} ★`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          {popularReviews.length === 0 ? (
            <div className="grid min-h-[min(360px,50vh)] place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-lg font-black text-slate-800 dark:text-white">Hali mashhur sharh yo&apos;q</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Birinchi sharhlar paydo bo&apos;lgach, eng ko&apos;p yoqqanlar shu yerda chiqadi.
                </p>
                {onOpenSection && (
                  <button
                    type="button"
                    onClick={() => onOpenSection("reviews")}
                    className="mt-4 rounded-2xl bg-premium-gradient px-6 py-3 text-sm font-black text-white shadow-glow"
                  >
                    {isStudent ? "Birinchi sharhni yozish" : "Sharhlarni ko'rish"}
                  </button>
                )}
              </div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="grid min-h-[min(280px,40vh)] place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="font-black text-slate-800 dark:text-white">Mos sharh topilmadi</p>
                <p className="mt-2 text-sm text-slate-500">Baho filtrini o&apos;zgartiring.</p>
                <button
                  type="button"
                  onClick={() => setRatingFilter("all")}
                  className="mt-4 text-sm font-black text-primary hover:underline"
                >
                  Filtrni tozalash
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {featuredReview && (
                <FeaturedReviewHero
                  item={featuredReview}
                  onLike={onLike}
                  onOpenUniversity={onOpenUniversity}
                />
              )}

              {otherReviews.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                    Boshqa mashhur sharhlar ({otherReviews.length})
                  </p>
                  <ul className="space-y-3">
                    {otherReviews.map((item, index) => (
                      <li key={item.id}>
                        <ReviewCard
                          item={item}
                          showUniversity
                          onLike={onLike}
                          onOpenUniversity={onOpenUniversity}
                          elevated
                          rank={index + 2}
                          showStudentVoiceBadge={!isStudent}
                          likeLabel="Yoqdi"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
