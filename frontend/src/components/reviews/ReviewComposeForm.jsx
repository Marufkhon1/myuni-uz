import { aspectRatingsComplete } from "../../utils/reviewAspects.js";
import ReviewAspectForm, { AspectRatingRows } from "./ReviewAspectForm.jsx";
import StarRatingRow from "./StarRatingRow.jsx";

function CompletionChip({ done, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
        done
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25"
          : "bg-slate-100 text-slate-400 ring-1 ring-slate-200/60 dark:bg-white/[0.05] dark:text-slate-500 dark:ring-white/10"
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-black ${
          done ? "bg-emerald-500 text-white" : "bg-slate-300 text-white dark:bg-slate-600"
        }`}
        aria-hidden="true"
      >
        {done ? "✓" : "·"}
      </span>
      {label}
    </span>
  );
}

function FormSection({ title, hint, done, children }) {
  return (
    <section className="border-b border-slate-100 px-5 py-5 last:border-b-0 dark:border-white/10 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">{title}</h4>
          {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        {done != null && (
          <span
            className={`text-[11px] font-bold ${done ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}
          >
            {done ? "Tayyor" : "Kerak"}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/** Google Reviews + Glassdoor — bitta sahifa, 3 qadamli stepper yo'q */
export default function ReviewComposeForm({
  title,
  subtitle,
  placeholder,
  overallLabel = "Qanday baho berasiz?",
  aspectHint = "Har bir yo'nalish alohida — aniqroq sharh beradi",
  footerNote = "Sharh moderatsiyadan o'tadi. Shaxsiy ma'lumot yozmang.",
  rating,
  onRatingChange,
  aspectRatings,
  onAspectChange,
  studyDirectionId,
  onStudyDirectionChange,
  directions,
  reviewText,
  onReviewTextChange,
  isSubmitting,
  onSubmit,
}) {
  const hasRating = rating > 0;
  const hasAspects = aspectRatingsComplete(aspectRatings);
  const hasText = reviewText.trim().length >= 30;
  const canSubmit = hasRating && hasAspects && hasText && !isSubmitting;
  const completedCount = [hasRating, hasAspects, hasText].filter(Boolean).length;

  return (
    <section id="review-compose-form" className="scroll-mt-4">
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 dark:bg-[#0f172a]/60 dark:ring-white/10"
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-white/10 dark:from-white/[0.03] dark:to-transparent sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</p>
              <h3 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                {subtitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Barcha bo&apos;limlarni to&apos;ldiring · taxminan 1 daqiqa
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 text-center ring-1 ring-slate-200/80 dark:bg-white/[0.04] dark:ring-white/10">
              <p className="text-base font-black tabular-nums leading-none text-slate-900 dark:text-white">
                {completedCount}/3
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">to&apos;ldirildi</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <CompletionChip done={hasRating} label="Umumiy baho" />
            <CompletionChip done={hasAspects} label="Mezonlar" />
            <CompletionChip done={hasText} label="Matn" />
          </div>
        </div>

        <FormSection
          title="Umumiy tajriba"
          hint="Universitetdagi umumiy tajribangizni baholang"
          done={hasRating}
        >
          <div className="flex justify-center rounded-xl bg-slate-50/80 py-6 dark:bg-white/[0.02]">
            <StarRatingRow
              value={rating}
              onChange={onRatingChange}
              size="lg"
              label={overallLabel}
              showHint
              centered
              variant="minimal"
            />
          </div>
        </FormSection>

        <FormSection
          title="Mezonlar bo'yicha"
          hint={aspectHint}
          done={hasAspects}
        >
          <AspectRatingRows aspectRatings={aspectRatings} onAspectChange={onAspectChange} />
        </FormSection>

        <FormSection
          title="Sharh matni"
          hint="Kamida 30 ta belgi — aniq va halol yozing"
          done={hasText}
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="review-text" className="sr-only">
                  Sharh matni
                </label>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                    reviewText.length > 1100
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                      : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                  }`}
                >
                  {reviewText.length}/1200
                </span>
              </div>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(event) => onReviewTextChange(event.target.value)}
                rows={5}
                maxLength={1200}
                placeholder={placeholder}
                className="min-h-[9rem] w-full resize-y rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-[15px] leading-[1.75] text-slate-900 outline-none ring-1 ring-slate-200/80 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/40 dark:bg-white/[0.04] dark:text-white dark:ring-white/10 dark:focus:ring-primary/50"
              />
              {reviewText.length > 0 && reviewText.length < 30 && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                  Yana {30 - reviewText.length} ta belgi kerak
                </p>
              )}
            </div>

            <ReviewAspectForm
              step="details"
              studyDirectionId={studyDirectionId}
              onStudyDirectionChange={onStudyDirectionChange}
              directions={directions}
            />
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{footerNote}</p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-primary dark:hover:text-white sm:min-w-[10rem]"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                Yuborilmoqda...
              </>
            ) : (
              "Sharhni yuborish"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
