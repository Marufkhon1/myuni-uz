import UniversityAvatar from "@/components/UniversityAvatar.jsx";
import { FractionalStars } from "@/components/ui/StarRatingDisplay.jsx";
import { MAX_COMPARE, MIN_COMPARE, formatCompareRating } from "@/utils/compareMath.js";
import { COMPARE_SLOT_THEMES } from "./compareTheme.js";

function SlotRating({ university, theme }) {
  const rating = university.average_rating;
  if (rating == null || Number.isNaN(Number(rating))) {
    return <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Hali sharh yo&apos;q</p>;
  }

  const label = formatCompareRating(rating);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <FractionalStars
        rating={Number(rating)}
        starClassName="text-[10px]"
        filledStarClassName="text-amber-400"
        emptyStarClassName="text-slate-300 dark:text-slate-600"
      />
      <span className={`text-[11px] font-bold tabular-nums ${theme.label}`}>
        {label}/5 · {university.review_count ?? 0} sharh
      </span>
    </div>
  );
}

export default function CompareSelectionTray({
  slots,
  universitiesById,
  onRemove,
  onClearAll,
  onSwap,
  maxLabel,
}) {
  const filledCount = slots.filter(Boolean).length;
  const progressPct = Math.round((filledCount / MAX_COMPARE) * 100);
  const ready = filledCount >= MIN_COMPARE;
  const remainingToMin = Math.max(0, MIN_COMPARE - filledCount);
  const slotsToRender = Math.max(filledCount, MIN_COMPARE, Math.min(MAX_COMPARE, filledCount + 1));
  const visibleSlotCount = Math.min(MAX_COMPARE, Math.max(slotsToRender, filledCount || MIN_COMPARE));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-primary/[0.05] via-white to-violet-500/[0.04] px-4 py-4 dark:border-white/10 dark:from-primary/10 dark:via-white/[0.02] dark:to-violet-500/5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Tanlangan OTMlar</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{maxLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filledCount >= 2 && onSwap && (
              <button
                type="button"
                onClick={onSwap}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-blue-200"
                title="Birinchi va ikkinchi OTMni almashtirish"
              >
                <span aria-hidden="true">⇄</span> Almashtirish
              </button>
            )}
            {filledCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
            <span className="text-slate-500 dark:text-slate-400">{filledCount} ta tanlandi</span>
            <span
              className={
                ready
                  ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-300/50 dark:text-emerald-300 dark:ring-emerald-400/30"
                  : "text-slate-400"
              }
            >
              {ready
                ? filledCount >= MAX_COMPARE
                  ? "✓ To'liq — taqqoslash tayyor"
                  : `✓ Taqqoslash tayyor (yana ${MAX_COMPARE - filledCount} qo'shish mumkin)`
                : `Yana kamida ${remainingToMin} ta kerak`}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ready ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-primary to-violet-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div
        className={`grid gap-3 p-4 sm:p-5 ${
          visibleSlotCount <= 2
            ? "sm:grid-cols-2"
            : visibleSlotCount === 3
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {Array.from({ length: visibleSlotCount }, (_, index) => {
          const id = slots[index];
          const university = id ? universitiesById.get(String(id)) : null;
          const theme = COMPARE_SLOT_THEMES[index];

          if (!university) {
            return (
              <div
                key={`empty-${index}`}
                className="relative flex min-h-[6.5rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/90 bg-slate-50/40 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-black text-slate-300 ring-1 ring-slate-200/80 dark:bg-white/[0.04] dark:text-slate-500 dark:ring-white/10">
                  {index + 1}
                </span>
                <span className="mt-2 text-[11px] font-bold text-slate-400">Bo&apos;sh slot</span>
                <span className="mt-0.5 text-[10px] text-slate-400/80">Pastdan OTM tanlang</span>
              </div>
            );
          }

          return (
            <div
              key={university.id}
              className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-white/[0.02] ${theme.accent} ${theme.ring} ring-1`}
            >
              <div className={`h-1 w-full ${theme.bar}`} aria-hidden="true" />
              <div className={`relative flex items-start gap-3 p-3 ${theme.bg}`}>
                <span
                  className={`absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black text-white shadow-sm ${theme.bar}`}
                >
                  {index + 1}
                </span>
                <div className="ml-5 mt-0.5 shrink-0">
                  <UniversityAvatar university={university} size="sm" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate pr-6 text-sm font-black text-slate-900 dark:text-white">
                    {university.short_name || university.name}
                  </p>
                  <SlotRating university={university} theme={theme} />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(String(university.id))}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/80 text-slate-400 ring-1 ring-slate-200/70 transition hover:bg-red-50 hover:text-red-600 dark:bg-white/[0.06] dark:ring-white/10 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  aria-label={`${university.short_name || university.name} ni olib tashlash`}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
