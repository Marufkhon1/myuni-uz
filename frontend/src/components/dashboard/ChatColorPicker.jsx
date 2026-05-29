import { CHAT_COLOR_OPTIONS, getAuthorColorClass, getColorOption } from "../../utils/chatAuthorColor.js";

const sectionLabelClass = "text-xs font-black uppercase tracking-[0.18em] text-primary";

export default function ChatColorPicker({
  displayName,
  userId,
  selectedColor,
  resolvedColor,
  isSaving,
  onSelect,
}) {
  const activeColorId = selectedColor || resolvedColor;
  const activeOption = getColorOption(activeColorId);
  const previewClass = getAuthorColorClass(userId, activeColorId);
  const isAuto = !selectedColor;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
        <p className={sectionLabelClass}>Chat rangi</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ismingiz chatda qanday rangda ko&apos;rinadi</p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[#eef2f7] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="border-b border-slate-200/60 px-4 py-2 dark:border-white/10">
            <p className="text-center text-sm font-bold text-slate-500">Guruh chat · preview</p>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-end gap-3">
              <div className="mb-5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-300 text-sm font-black text-white dark:bg-white/15">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={`truncate text-base font-black ${previewClass}`}>{displayName || "Ismingiz"}</p>
                <div className="mt-1.5 inline-block max-w-full rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                  Tanlangan rang bilan shunday ko&apos;rinasiz
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {isAuto ? "Avtomatik rang" : "Tanlangan rang"}
          </p>
          {activeOption && (
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"
              style={{
                backgroundColor: `${activeOption.hex}22`,
                color: activeOption.hex,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeOption.hex }} />
              {isAuto ? `Avto · ${activeOption.label}` : activeOption.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
          {CHAT_COLOR_OPTIONS.map((option) => {
            const isManualActive = selectedColor === option.id;
            const isAutoMatch = isAuto && resolvedColor === option.id;
            const isHighlighted = isManualActive || isAutoMatch;

            return (
              <button
                key={option.id}
                type="button"
                disabled={isSaving}
                title={option.label}
                aria-pressed={isManualActive}
                onClick={() => onSelect(option.id)}
                className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition disabled:opacity-50 ${
                  isManualActive
                    ? "border-primary bg-blue-50/80 shadow-sm dark:bg-blue-400/10"
                    : isAutoMatch
                      ? "border-slate-300 bg-slate-50 dark:border-white/20 dark:bg-white/[0.04]"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
                }`}
              >
                <span className="relative">
                  <span
                    className={`block h-9 w-9 rounded-full shadow-sm ring-2 ring-white transition group-hover:scale-105 dark:ring-slate-900 ${
                      isHighlighted ? "scale-105" : ""
                    } ${isManualActive ? "ring-primary/40 ring-offset-1 ring-offset-white dark:ring-offset-slate-900" : ""}`}
                    style={{ backgroundColor: option.hex }}
                  />
                  {isManualActive && (
                    <span className="absolute inset-0 grid place-items-center rounded-full bg-black/25 text-xs font-black text-white">
                      ✓
                    </span>
                  )}
                  {isAutoMatch && !isManualActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white ring-2 ring-slate-400 dark:ring-slate-600" />
                  )}
                </span>
                <span
                  className={`max-w-full truncate text-[10px] font-bold sm:text-xs ${
                    isManualActive ? "text-primary" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isSaving ? "Saqlanmoqda..." : "Bosing — darhol saqlanadi"}
          </p>
          {selectedColor ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSelect("")}
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-white/15 dark:text-slate-300"
            >
              Avtomatik
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">Avto rejim</span>
          )}
        </div>
      </div>
    </div>
  );
}
