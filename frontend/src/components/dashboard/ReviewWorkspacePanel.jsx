import ReviewCard from "./ReviewCard.jsx";
import ReviewPanelPlaceholder from "./ReviewPanelPlaceholder.jsx";
import UniversityCampusBanner from "../UniversityCampusBanner.jsx";
import UniversityRatingStars from "./UniversityRatingStars.jsx";
import { formatUniversityMetaHeader } from "../UniversityMetaLine.jsx";

export default function ReviewWorkspacePanel({
  isStudent,
  isPhone,
  reviewUniversity,
  reviewUniversityDetail,
  isReviewDetailLoading,
  reviews,
  onBack,
  onSubmitReview,
  rating,
  onRatingChange,
  reviewText,
  onReviewTextChange,
  isReviewSubmitting,
  reviewSubmitError,
  onLike,
  stars,
  className = "",
}) {
  if (!reviewUniversity) {
    return (
      <ReviewPanelPlaceholder
        className={className}
        title={isStudent ? "Avval universitetni tanlang" : "Universitet tanlang"}
        description={
          isStudent
            ? "Chap ro'yxatdan universitetni tanlang — ma'lumot, sharhlar va yozish shu yerda ochiladi."
            : "Chap ro'yxatdan universitetni tanlang — ma'lumot va talabalar sharhlari shu yerda."
        }
      />
    );
  }

  if (isReviewDetailLoading) {
    return (
      <div
        className={`grid min-h-[min(420px,calc(100dvh-14rem))] place-items-center rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] ${className}`}
      >
        <p className="font-black text-primary">Ma&apos;lumot yuklanmoqda...</p>
      </div>
    );
  }

  const shortName = reviewUniversityDetail?.short_name;
  const averageRating = reviewUniversityDetail?.average_rating;
  const reviewCount = reviewUniversityDetail?.review_count ?? 0;
  const metaHeader = formatUniversityMetaHeader(reviewUniversityDetail);

  return (
    <div
      className={`flex min-h-[min(520px,calc(100dvh-11rem))] max-h-[calc(100dvh-11rem)] min-w-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] md:max-h-[calc(100vh-10rem)] ${className}`}
    >
      {isPhone && (
        <div className="shrink-0 border-b border-slate-100 px-5 py-3 dark:border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-black text-primary"
          >
            ← Universitetlar
          </button>
        </div>
      )}

      <div className="relative shrink-0 overflow-hidden">
        <UniversityCampusBanner university={reviewUniversityDetail} className="h-32 sm:h-36" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Universitet</p>
          <h2 className="mt-0.5 text-lg font-black leading-snug text-white sm:text-xl">
            {reviewUniversityDetail?.name}
          </h2>
          {reviewUniversityDetail?.location && (
            <p className="mt-0.5 text-xs font-semibold text-slate-200">{reviewUniversityDetail.location}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <UniversityRatingStars rating={averageRating} />
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-black text-white backdrop-blur-sm">
              {reviewCount} ta sharh
            </span>
            {metaHeader && (
              <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm sm:inline">
                {metaHeader}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {metaHeader && (
          <p className="border-b border-slate-100 px-5 py-2.5 text-xs font-semibold text-primary dark:border-white/10 sm:hidden">
            {metaHeader}
          </p>
        )}

        {reviewUniversityDetail?.summary && (
          <p className="border-b border-slate-100 px-5 py-3 text-xs leading-5 text-slate-600 dark:border-white/10 dark:text-slate-300 sm:px-6">
            {reviewUniversityDetail.summary}
          </p>
        )}

        {!isStudent && (
          <div className="border-b border-blue-200/80 bg-blue-50/80 px-5 py-3 text-xs leading-5 text-primary dark:border-primary/30 dark:bg-blue-400/10 dark:text-blue-200 sm:px-6">
            Sharh yozish faqat talabalarga ochiq. Siz talabalar tajribasini o&apos;qishingiz mumkin.
          </div>
        )}

        {isStudent && (
          <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
            <form
              onSubmit={onSubmitReview}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wide text-primary">Sharh yozish</span>
                <div className="flex gap-1">
                  {stars.map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onRatingChange(star)}
                      className={`grid h-10 w-10 place-items-center rounded-xl border text-lg transition sm:h-11 sm:w-11 sm:text-xl ${
                        star <= rating
                          ? "border-amber-300 bg-amber-50 text-amber-500 shadow-sm"
                          : "border-slate-200 bg-white text-slate-300 hover:border-amber-200 dark:border-white/10 dark:bg-white/5"
                      }`}
                      aria-label={`${star} yulduz`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-500">{rating ? `${rating}/5` : "Baho tanlang"}</span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <textarea
                  value={reviewText}
                  onChange={(event) => onReviewTextChange(event.target.value)}
                  rows={4}
                  placeholder="O'qish muhiti, ustozlar, imkoniyatlar haqida yozing..."
                  className="min-h-[7.5rem] flex-1 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25"
                />
                <button
                  type="submit"
                  disabled={rating === 0 || !reviewText.trim() || isReviewSubmitting}
                  className="shrink-0 rounded-xl bg-premium-gradient px-6 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
                >
                  {isReviewSubmitting ? "Saqlanmoqda..." : "Sharhni yuborish"}
                </button>
              </div>

              {reviewSubmitError && (
                <p className="mt-3 text-sm font-semibold text-red-600">{reviewSubmitError}</p>
              )}
            </form>
          </div>
        )}

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Sharhlar</p>
              <h3 className="mt-0.5 text-base font-black text-slate-950 dark:text-white sm:text-lg">
                {shortName
                  ? `${shortName} sharhlari`
                  : isStudent
                    ? "Talabalar fikri"
                    : "Talabalar tajribasi"}
              </h3>
            </div>
            {reviews.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {reviews.length}
              </span>
            )}
          </div>

          <div className="mt-4">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
                <p className="font-black text-slate-800 dark:text-white">Hali sharh yo&apos;q</p>
                <p className="mt-1 text-sm text-slate-500">
                  {isStudent ? "Yuqoridagi formadan birinchi sharhni qoldiring." : "Hali sharh qoldirilmagan."}
                </p>
              </div>
            ) : (
              <ul className={`grid gap-3 ${reviews.length > 1 ? "lg:grid-cols-2" : ""}`}>
                {reviews.map((item) => (
                  <li key={item.id}>
                    <ReviewCard item={item} onLike={onLike} elevated />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
