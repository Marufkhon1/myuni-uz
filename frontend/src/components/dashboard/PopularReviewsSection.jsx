import { useMemo } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UserAvatar from "./UserAvatar.jsx";
import ReviewCard from "./ReviewCard.jsx";
import { resolveMediaUrl } from "../../utils/media.js";

function StatTile({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-center ${
        accent
          ? "border-violet-200/80 bg-violet-50 dark:border-violet-400/20 dark:bg-violet-400/10"
          : "border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase ${
          accent ? "text-violet-600 dark:text-violet-300" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-0.5 text-lg font-black ${
          accent ? "text-violet-800 dark:text-violet-200" : "text-slate-800 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FeaturedReviewCard({ item, onLike, onOpenUniversity }) {
  const dateLabel = new Date(item.created_at).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-blue-50/90 via-white to-white p-5 shadow-soft dark:border-primary/30 dark:from-blue-400/10 dark:via-white/[0.06] dark:to-white/[0.04] sm:p-6">
      <div className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
        #1 mashhur
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <UserAvatar
          name={item.author}
          avatarUrl={resolveMediaUrl(item.author_avatar_url || "")}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">{item.author}</h3>
          {item.university?.name && (
            <button
              type="button"
              onClick={() => onOpenUniversity?.(item.university.id)}
              className="mt-1 text-left text-sm font-bold text-primary hover:underline"
            >
              {item.university.name}
            </button>
          )}
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{dateLabel}</p>
          <p className="mt-1 text-amber-400">
            {"★".repeat(item.rating)}
            <span className="ml-2 text-sm font-black text-slate-600 dark:text-slate-300">
              {item.rating}/5
            </span>
          </p>
          <p className="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">{item.text}</p>
          <button
            type="button"
            onClick={() => onLike(item.id)}
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-black transition ${
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

export default function PopularReviewsSection({
  popularReviews,
  onLike,
  onOpenSection,
  onOpenUniversity,
  isStudent = false,
}) {
  const stats = useMemo(() => {
    const totalLikes = popularReviews.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
    const averageRating =
      popularReviews.length > 0
        ? (
            popularReviews.reduce((sum, item) => sum + (item.rating ?? 0), 0) / popularReviews.length
          ).toFixed(1)
        : null;

    const universityMap = new Map();
    for (const review of popularReviews) {
      const university = review.university;
      if (!university?.id) {
        continue;
      }
      const current = universityMap.get(university.id) || {
        university,
        likes: 0,
        reviewCount: 0,
      };
      current.likes += review.like_count ?? 0;
      current.reviewCount += 1;
      universityMap.set(university.id, current);
    }

    const topUniversities = [...universityMap.values()]
      .sort((left, right) => right.likes - left.likes)
      .slice(0, 5);

    return {
      count: popularReviews.length,
      totalLikes,
      averageRating,
      topUniversities,
    };
  }, [popularReviews]);

  const topReview = popularReviews[0] ?? null;
  const otherReviews = popularReviews.slice(1);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:items-start xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch">
        <div className="flex h-fit w-full max-w-sm flex-col justify-self-center rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6 md:max-w-none md:justify-self-start xl:min-h-[480px] xl:max-w-[320px] xl:self-stretch dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Mashhur</p>
          <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">Eng ko&apos;p yoqqanlar</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {isStudent
              ? "Talabalar like bosgan sharhlar — o'zingiz ham qo'shishingiz mumkin."
              : "Talabalar like bosgan sharhlar — tanlov uchun o'qing."}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatTile label="Sharh" value={stats.count} />
            <StatTile label="Like" value={stats.totalLikes} accent />
            <StatTile
              label="O'rtacha"
              value={stats.averageRating != null ? `${stats.averageRating}/5` : "—"}
            />
          </div>

          {topReview && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/90 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">Lider sharh</p>
              <div className="mt-2 flex items-center gap-3">
                <UserAvatar
                  name={topReview.author}
                  avatarUrl={resolveMediaUrl(topReview.author_avatar_url || "")}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{topReview.author}</p>
                  <p className="text-xs font-bold text-primary">
                    ♥ {topReview.like_count ?? 0} · {topReview.rating}/5
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.topUniversities.length > 0 && (
            <div className="mt-4 min-h-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/90 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">
                Universitetlar
              </p>
              <ul className="mt-2 space-y-2">
                {stats.topUniversities.map(({ university, likes, reviewCount }, index) => (
                  <li key={university.id}>
                    <button
                      type="button"
                      onClick={() => onOpenUniversity?.(university.id)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 text-left transition hover:border-primary hover:bg-blue-50/60 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/40"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <UniversityAvatar university={university} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-800 dark:text-white">
                          {university.short_name || university.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {likes} like · {reviewCount} sharh
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {onOpenSection && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenSection("reviews")}
                  className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-950 dark:hover:bg-primary dark:hover:text-white"
                >
                  Barcha sharhlarni ko&apos;rish
                </button>
                <button
                  type="button"
                  onClick={() => onOpenSection("compare")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:text-slate-200"
                >
                  Universitetlarni taqqoslash
                </button>
              </>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            {isStudent
              ? "Yoqdi tugmasi orqali qo'llab-quvvatlang — o'z sharhingiz ham mashhur bo'lishi mumkin."
              : "Abituriyent sifatida o'qing va tanlovingizni aniqlashtiring."}
          </p>
        </div>

        <div className="flex min-w-0 flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6 dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Sharhlar ro&apos;yxati</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            Eng ko&apos;p yoqqan sharhlar
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isStudent
              ? "Eng ko'p yoqqan sharhlar — o'z sharhingiz ham shu ro'yxatga chiqishi mumkin."
              : "Talabalar eng ko'p like bosgan sharhlar — abituriyentlar uchun tanlov yo'riqnomasi."}
          </p>

          {popularReviews.length === 0 ? (
            <div className="mt-6 grid flex-1 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-lg font-black">Hali mashhur sharh yo&apos;q</p>
                <p className="mt-2 text-sm text-slate-500">
                  Birinchi sharhlar paydo bo&apos;lgach, eng ko&apos;p yoqqanlar shu yerda chiqadi.
                </p>
                {onOpenSection && (
                  <button
                    type="button"
                    onClick={() => onOpenSection("reviews")}
                    className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white"
                  >
                    {isStudent ? "Birinchi sharhni yozish" : "Sharhlarni ko'rish"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {topReview && (
                <FeaturedReviewCard
                  item={topReview}
                  onLike={onLike}
                  onOpenUniversity={onOpenUniversity}
                />
              )}

              {otherReviews.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                    Boshqa mashhur sharhlar ({otherReviews.length})
                  </p>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {otherReviews.map((item) => (
                      <ReviewCard key={item.id} item={item} showUniversity onLike={onLike} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
