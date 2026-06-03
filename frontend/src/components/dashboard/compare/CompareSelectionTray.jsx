import UniversityAvatar from "../../UniversityAvatar.jsx";
import { MAX_COMPARE } from "../../../utils/compareMath.js";
import { COMPARE_SLOT_THEMES } from "./compareTheme.js";

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
  const ready = filledCount === MAX_COMPARE;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Tanlangan OTMlar</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{maxLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {filledCount >= 2 && onSwap && (
            <button
              type="button"
              onClick={onSwap}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/80 transition hover:ring-primary dark:text-slate-300 dark:ring-white/10"
              title="Birinchi va ikkinchi OTMni almashtirish"
            >
              ⇄ Almashtirish
            </button>
          )}
          {filledCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200/80 transition hover:text-red-600 hover:ring-red-200 dark:ring-white/10"
            >
              Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>{filledCount} ta tanlandi</span>
          <span className={ready ? "text-emerald-600 dark:text-emerald-400" : ""}>
            {ready ? "Taqqoslash tayyor" : `Yana ${MAX_COMPARE - filledCount} ta kerak`}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              ready ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {Array.from({ length: MAX_COMPARE }, (_, index) => {
          const id = slots[index];
          const university = id ? universitiesById.get(String(id)) : null;
          const theme = COMPARE_SLOT_THEMES[index];

          if (!university) {
            return (
              <div
                key={`empty-${index}`}
                className="flex min-h-[5rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-300 dark:bg-white/10">
                  {index + 1}
                </span>
                <span className="mt-1.5 px-2 text-center text-[11px] font-bold text-slate-400">
                  Bo&apos;sh slot
                </span>
              </div>
            );
          }

          return (
            <div
              key={university.id}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 ring-2 ${theme.ring} ${theme.bg}`}
            >
              <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-slate-900">
                {index + 1}
              </span>
              <UniversityAvatar university={university} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                  {university.short_name || university.name}
                </p>
                {university.average_rating != null ? (
                  <p className={`text-[11px] font-semibold ${theme.label}`}>
                    ★ {university.average_rating}/5 · {university.review_count ?? 0} sharh
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">Hali sharh yo&apos;q</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(String(university.id))}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 ring-1 ring-slate-200/80 transition hover:bg-red-50 hover:text-red-600 dark:ring-white/10"
                aria-label={`${university.short_name || university.name} ni olib tashlash`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
