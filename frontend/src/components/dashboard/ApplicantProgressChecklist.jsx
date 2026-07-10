import { useDashboard } from "@/hooks/useDashboard.js";
import {
  getApplicantChecklistProgress,
  getDashboardChecklistSteps,
} from "@/utils/applicantChecklist.js";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function ApplicantProgressChecklist({
  profile,
  joinedChatCount,
  universities,
}) {
  const { isStudent, changeSection } = useDashboard();
  const steps = getDashboardChecklistSteps({ isStudent, profile, joinedChatCount, universities });
  const { doneCount, totalCount, isComplete } = getApplicantChecklistProgress(steps);
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:rounded-[2rem] sm:p-6">
      <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary sm:text-xs sm:tracking-[0.18em]">
            Boshlang&apos;ich qadamlar
          </p>
          <h2 className="mt-0.5 text-base font-black text-slate-950 sm:mt-1 sm:text-lg dark:text-white">
            {isComplete ? "Hammasi tayyor!" : `${doneCount}/${totalCount} qadam bajarildi`}
          </h2>
          <p className="mt-1 text-xs font-medium leading-snug text-slate-500 sm:text-sm dark:text-slate-400">
            {isComplete
              ? "Endi chat, sharhlar va taqqoslashdan to'liq foydalaning."
              : "Kabinet imkoniyatlarini ketma-ket oching."}
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-blue-50 px-2.5 py-1.5 text-xs font-black text-primary dark:bg-blue-400/10 dark:text-blue-200 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm">
          {progressPercent}%
        </span>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 sm:mt-4 sm:h-2"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label={`Bajarilgan qadamlar: ${doneCount} dan ${totalCount}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="mt-3 space-y-1.5 sm:mt-5 sm:space-y-2">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => !step.done && changeSection(step.section)}
              disabled={step.done}
              className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 ${
                step.done
                  ? "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                  : "border-slate-200/80 bg-slate-50/80 hover:border-primary/30 hover:bg-blue-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-blue-400/10"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-black sm:h-9 sm:w-9 sm:rounded-xl sm:text-xs ${
                  step.done
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10"
                }`}
                aria-hidden="true"
              >
                {step.done ? <CheckIcon /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-slate-900 dark:text-white">
                  {step.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-500 sm:text-xs dark:text-slate-400">
                  {step.description}
                </span>
              </span>
              {!step.done && (
                <span className="hidden shrink-0 text-xs font-black text-primary dark:text-blue-200 sm:inline">
                  Boshlash
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
