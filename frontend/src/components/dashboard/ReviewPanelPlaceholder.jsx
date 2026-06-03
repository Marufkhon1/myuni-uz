function PlaceholderIllustration() {
  return (
    <div className="relative mx-auto grid h-24 w-24 place-items-center">
      <span
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-violet-500/15 to-sky-400/20 blur-md"
        aria-hidden="true"
      />
      <span
        className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 ring-1 ring-primary/20 dark:from-primary/25 dark:to-violet-500/15 dark:ring-primary/30"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" aria-hidden="true">
          <path
            d="M32 18 20 26v4h24v-4L32 18Z"
            className="fill-primary/70 dark:fill-blue-300/80"
          />
          <rect
            x="24"
            y="32"
            width="6"
            height="14"
            rx="1"
            className="fill-white stroke-primary stroke-[1.5] dark:fill-slate-900 dark:stroke-blue-300"
          />
          <rect
            x="31"
            y="32"
            width="6"
            height="14"
            rx="1"
            className="fill-white stroke-primary stroke-[1.5] dark:fill-slate-900 dark:stroke-blue-300"
          />
          <rect
            x="38"
            y="32"
            width="6"
            height="14"
            rx="1"
            className="fill-white stroke-primary stroke-[1.5] dark:fill-slate-900 dark:stroke-blue-300"
          />
          <path d="M18 48h28" className="stroke-primary stroke-[2] dark:stroke-blue-300" />
          <circle
            cx="46"
            cy="22"
            r="9"
            className="fill-white stroke-violet-500 stroke-[2] dark:fill-slate-900 dark:stroke-violet-400"
          />
          <path
            d="M51 27l5 5"
            className="stroke-violet-600 stroke-[2] [stroke-linecap:round] dark:stroke-violet-300"
          />
        </svg>
      </span>
    </div>
  );
}

const APPLICANT_STEPS = [
  {
    step: "1",
    title: "OTM tanlang",
    description: "Chap ro'yxatdan qiziqayotgan universitetni belgilang.",
  },
  {
    step: "2",
    title: "Sharhlarni o'qing",
    description: "Reyting, taqsimot va talabalar tajribasini ko'ring.",
  },
  {
    step: "3",
    title: "Taqqoslang",
    description: "Uchta universitetni taqqoslang yoki chatda savol bering.",
  },
];

const STUDENT_STEPS = [
  {
    step: "1",
    title: "OTM tanlang",
    description: "O'qiyotgan yoki sharh qoldirmoqchi bo'lgan universitetni tanlang.",
  },
  {
    step: "2",
    title: "Sharh yozing",
    description: "Tajribangizni baho va izoh bilan ulashing.",
  },
  {
    step: "3",
    title: "Hamjamiyat",
    description: "Chatda abituriyentlarga javob bering.",
  },
];

export default function ReviewPanelPlaceholder({ title, description, isStudent = false, className = "" }) {
  const steps = isStudent ? STUDENT_STEPS : APPLICANT_STEPS;

  return (
    <div
      className={`relative flex min-h-[min(520px,calc(100dvh-14rem))] min-w-0 flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 dark:bg-[#0b1220]/80 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] dark:ring-white/10 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(37,99,235,0.08), transparent 45%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.08), transparent 40%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:px-10 sm:py-14">
        <PlaceholderIllustration />
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
          {isStudent ? "Sharh markazi" : "Tanlov markazi"}
        </p>
        <h3 className="mt-2 max-w-md text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{title}</h3>
        {description && (
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base dark:text-slate-400">
            {description}
          </p>
        )}

        <ol className="mt-10 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
          {steps.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 transition hover:border-primary/25 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/30 dark:hover:bg-white/[0.06]"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary dark:bg-primary/20 dark:text-blue-200">
                {item.step}
              </span>
              <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-xs font-medium text-slate-400 dark:text-slate-500">
          Niche va Unigo kabi — barcha ma&apos;lumot bir joyda, talabalar tajribasi asosida
        </p>
      </div>
    </div>
  );
}
