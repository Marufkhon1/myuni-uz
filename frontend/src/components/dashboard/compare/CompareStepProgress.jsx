import { MAX_COMPARE } from "../../../utils/compareMath.js";

const STEPS = [
  { id: "pick", label: "Tanlang" },
  { id: "compare", label: "Solishtiring" },
  { id: "decide", label: "Xulosa" },
];

export default function CompareStepProgress({ selectedCount, hasResults }) {
  const activeIndex = hasResults ? 2 : selectedCount >= MAX_COMPARE ? 1 : 0;

  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Taqqoslash bosqichlari">
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isCurrent = index === activeIndex;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black transition ${
                  isDone
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-primary/15 text-primary ring-2 ring-primary/40"
                      : "bg-slate-100 text-slate-400 dark:bg-white/10"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </span>
              <span
                className={`hidden truncate text-xs font-bold sm:block ${
                  isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 min-w-[0.75rem] flex-1 rounded-full ${
                  index < activeIndex ? "bg-primary" : "bg-slate-200 dark:bg-white/10"
                }`}
              />
            )}
          </li>
        );
      })}
      <span className="ml-1 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black tabular-nums text-slate-600 dark:bg-white/10 dark:text-slate-300">
        {selectedCount}/{MAX_COMPARE}
      </span>
    </ol>
  );
}
