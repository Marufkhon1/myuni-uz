import { useDashboard } from "@/hooks/useDashboard.js";
import {
  getApplicantChecklistProgress,
  getDashboardChecklistSteps,
} from "@/utils/applicantChecklist.js";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Boshlang&apos;ich qadamlar</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {isComplete ? "Hammasi tayyor!" : `${doneCount}/${totalCount} qadam bajarildi`}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {isComplete
              ? "Endi chat, sharhlar va taqqoslashdan to'liq foydalaning."
              : "Kabinet imkoniyatlarini ketma-ket oching."}
          </p>
        </div>
        <span className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-primary dark:bg-blue-400/10 dark:text-blue-200">
          {progressPercent}%
        </span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
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

      <ul className="mt-5 space-y-2">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => !step.done && changeSection(step.section)}
              disabled={step.done}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition sm:px-4 ${
                step.done
                  ? "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                  : "border-slate-200/80 bg-slate-50/80 hover:border-primary/30 hover:bg-blue-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-blue-400/10"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${
                  step.done
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10"
                }`}
                aria-hidden="true"
              >
                {step.done ? <CheckIcon /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-black text-slate-900 dark:text-white">{step.label}</span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {step.description}
                </span>
              </span>
              {!step.done && (
                <span className="shrink-0 text-xs font-black text-primary dark:text-blue-200">Boshlash</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
