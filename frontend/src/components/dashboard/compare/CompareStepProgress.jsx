import { MAX_COMPARE } from "@/utils/compareMath.js";

const STEPS = [
  { id: "pick", label: "Tanlang", hint: "3 ta OTM" },
  { id: "compare", label: "Solishtiring", hint: "Jadval" },
  { id: "decide", label: "Xulosa", hint: "Natija" },
];

export default function CompareStepProgress({ selectedCount, hasResults }) {
  const activeIndex = hasResults ? 2 : selectedCount >= MAX_COMPARE ? 1 : 0;

  return (
    <div className="w-full min-w-0 lg:max-w-md">
      <ol className="flex items-center gap-1 sm:gap-2" aria-label="Taqqoslash bosqichlari">
        {STEPS.map((step, index) => {
          const isDone = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <div className="flex min-w-0 flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-black transition-all ${
                    isDone
                      ? "bg-primary text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.55)]"
                      : isCurrent
                        ? "bg-primary/12 text-primary ring-2 ring-primary/35 dark:bg-primary/20"
                        : "bg-slate-100 text-slate-400 dark:bg-white/10"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <div className="hidden min-w-0 text-center sm:block sm:text-left">
                  <span
                    className={`block truncate text-xs font-black ${
                      isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block truncate text-[10px] font-semibold text-slate-400">{step.hint}</span>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 min-w-[0.5rem] flex-1 rounded-full transition-colors ${
                    index < activeIndex ? "bg-primary" : "bg-slate-200 dark:bg-white/10"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-right text-[10px] font-black tabular-nums text-slate-400">
        {selectedCount}/{MAX_COMPARE} tanlandi
      </p>
    </div>
  );
}
