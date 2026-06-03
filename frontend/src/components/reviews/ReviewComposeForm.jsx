import { aspectRatingsComplete } from "../../utils/reviewAspects.js";
import ReviewAspectForm, { AspectRatingRows } from "./ReviewAspectForm.jsx";
import StarRatingRow from "./StarRatingRow.jsx";

const COMPOSE_STEPS = [
  { key: "rating", label: "Umumiy baho" },
  { key: "aspects", label: "Mezonlar" },
  { key: "text", label: "Matn" },
];

function ProgressRing({ completed, total = 3 }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <div
      className="relative grid h-[3.75rem] w-[3.75rem] shrink-0 place-items-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-white/[0.05] dark:ring-white/10"
      aria-label={`${completed} ta ${total} bo'lim to'ldirildi`}
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className="stroke-slate-200/80 dark:stroke-white/10"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out dark:stroke-blue-400"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative text-center">
        <p className="text-base font-black tabular-nums leading-none text-slate-900 dark:text-white">
          {completed}/{total}
        </p>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">tayyor</p>
      </div>
    </div>
  );
}

function CompletionChip({ done, label, index, isLast }) {
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <span
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-bold transition-all duration-300 sm:px-3 ${
          done
            ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-300/60 dark:bg-emerald-400/12 dark:text-emerald-300 dark:ring-emerald-400/30"
            : "bg-white/70 text-slate-500 ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10"
        }`}
      >
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black transition-colors ${
            done
              ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.45)]"
              : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
          }`}
          aria-hidden="true"
        >
          {done ? "✓" : index + 1}
        </span>
        <span className="truncate">{label}</span>
      </span>
      {!isLast && (
        <span
          className={`mx-1 hidden h-px w-3 shrink-0 sm:block ${done ? "bg-emerald-300/70 dark:bg-emerald-400/35" : "bg-slate-200 dark:bg-white/10"}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function TextLengthProgress({ length, min = 30, max = 1200 }) {
  const percent = Math.min(100, (length / max) * 100);
  const minMarker = (min / max) * 100;
  const isValid = length >= min;
  const isNearLimit = length > 1100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold">
        <span className={isValid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
          {isValid ? "Minimal uzunlik yetarli" : `Kamida ${min} ta belgi kerak`}
        </span>
        <span
          className={`tabular-nums ${isNearLimit ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}
        >
          {length}/{max}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isValid
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : "bg-gradient-to-r from-primary/70 to-violet-500/80"
          }`}
          style={{ width: `${percent}%` }}
        />
        <span
          className="absolute top-0 h-full w-0.5 bg-amber-400/90"
          style={{ left: `${minMarker}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function ModerationNote({ children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-white/70 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm dark:bg-white/[0.06]"
        aria-hidden="true"
      >
        🛡️
      </span>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{children}</p>
    </div>
  );
}

function SectionStatus({ done }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition-colors ${
        done
          ? "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-300/55 dark:text-emerald-300 dark:ring-emerald-400/30"
          : "bg-slate-100 text-slate-400 ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:text-slate-500 dark:ring-white/10"
      }`}
    >
      {done ? "✓ Tayyor" : "Kerak"}
    </span>
  );
}

function FormSection({ title, hint, done, children, tone = "default" }) {
  const toneBar =
    tone === "amber"
      ? "from-amber-400 to-orange-400"
      : tone === "violet"
        ? "from-violet-400 to-primary"
        : "from-primary to-violet-500";

  return (
    <section className="relative border-b border-slate-100 px-5 py-5 last:border-b-0 dark:border-white/10 sm:px-6 sm:py-6">
      {done && (
        <span
          className={`absolute bottom-5 left-0 top-5 w-1 rounded-r-full bg-gradient-to-b ${toneBar} opacity-80`}
          aria-hidden="true"
        />
      )}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white">{title}</h4>
          {hint && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        {done != null && <SectionStatus done={done} />}
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
  const steps = [
    { done: hasRating, label: COMPOSE_STEPS[0].label },
    { done: hasAspects, label: COMPOSE_STEPS[1].label },
    { done: hasText, label: COMPOSE_STEPS[2].label },
  ];
  const completedCount = steps.filter((step) => step.done).length;

  return (
    <section id="review-compose-form" className="scroll-mt-4">
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 dark:bg-[#0f172a]/60 dark:ring-white/10"
      >
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-primary/[0.06] via-slate-50 to-violet-50/40 px-5 py-5 dark:border-white/10 dark:from-primary/10 dark:via-[#0b1324] dark:to-violet-950/20 sm:px-6">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl dark:bg-blue-500/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-1/3 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl dark:bg-violet-500/10"
            aria-hidden="true"
          />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary dark:text-blue-300">
                {title}
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {subtitle}
              </h3>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-block h-1 w-1 rounded-full bg-primary/70 dark:bg-blue-400" aria-hidden="true" />
                Barcha bo&apos;limlarni to&apos;ldiring
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                  ·
                </span>
                taxminan 1 daqiqa
              </p>
            </div>
            <ProgressRing completed={completedCount} />
          </div>

          <div className="relative mt-4 flex gap-1 sm:gap-1.5">
            {steps.map((step, index) => (
              <CompletionChip
                key={step.label}
                done={step.done}
                label={step.label}
                index={index}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>

        <FormSection
          title="Umumiy tajriba"
          hint="Universitetdagi umumiy tajribangizni baholang"
          done={hasRating}
          tone="amber"
        >
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-amber-400/15 dark:from-amber-500/[0.08] dark:via-white/[0.02] dark:to-orange-500/[0.04] sm:px-8 sm:py-10">
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl dark:bg-amber-400/10"
              aria-hidden="true"
            />
            <div className="relative flex justify-center">
              <StarRatingRow
                value={rating}
                onChange={onRatingChange}
                size="lg"
                label={overallLabel}
                showHint
                centered
                variant="default"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Mezonlar bo'yicha" hint={aspectHint} done={hasAspects} tone="violet">
          <AspectRatingRows aspectRatings={aspectRatings} onAspectChange={onAspectChange} />
        </FormSection>

        <FormSection
          title="Sharh matni"
          hint="Kamida 30 ta belgi — aniq va halol yozing"
          done={hasText}
          tone="default"
        >
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:border-primary/20 dark:from-primary/[0.07] dark:via-white/[0.02] dark:to-violet-950/15">
              <div
                className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl dark:bg-blue-500/10"
                aria-hidden="true"
              />

              <div className="relative border-b border-slate-200/60 px-4 py-3 dark:border-white/10 sm:px-5">
                <TextLengthProgress length={reviewText.length} />
              </div>

              <textarea
                id="review-text"
                value={reviewText}
                onChange={(event) => onReviewTextChange(event.target.value)}
                rows={6}
                maxLength={1200}
                placeholder={placeholder}
                className="relative min-h-[11rem] w-full resize-y border-0 bg-transparent px-4 py-4 text-[15px] leading-[1.8] text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white/50 dark:text-white dark:focus:bg-white/[0.02] sm:px-5 sm:py-5"
              />

              {reviewText.length > 0 && reviewText.length < 30 && (
                <div className="border-t border-amber-200/60 bg-amber-50/60 px-4 py-2.5 dark:border-amber-400/15 dark:bg-amber-500/[0.07] sm:px-5">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Yana {30 - reviewText.length} ta belgi — tajribangizni biroz batafsil yozing
                  </p>
                </div>
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

        <div className="relative overflow-hidden border-t border-slate-200/70 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 px-5 py-5 dark:border-white/10 dark:from-[#0b1324] dark:via-[#0f172a] dark:to-[#0b1324] sm:px-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ModerationNote>{footerNote}</ModerationNote>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black transition-all sm:w-auto sm:min-w-[12.5rem] ${
                canSubmit
                  ? "bg-gradient-to-r from-primary to-violet-600 text-white shadow-[0_12px_32px_-10px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_36px_-10px_rgba(37,99,235,0.65)] active:translate-y-0"
                  : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none dark:bg-white/[0.06] dark:text-slate-500"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  Sharhni yuborish
                  {canSubmit && <span aria-hidden="true">→</span>}
                </>
              )}
            </button>
          </div>
          {!canSubmit && !isSubmitting && (
            <p className="mt-3 text-center text-[11px] font-semibold text-slate-400 lg:text-right">
              Yuborish uchun barcha bo&apos;limlarni to&apos;ldiring
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
