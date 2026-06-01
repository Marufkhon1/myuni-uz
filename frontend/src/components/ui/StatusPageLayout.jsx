import { Link } from "react-router-dom";
import { mainContentProps } from "../../utils/mainContent.js";

const illustrations = {
  notFound: (
    <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28 sm:h-32 sm:w-32" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="54" className="fill-blue-100 dark:fill-blue-400/15" />
      <text x="60" y="72" textAnchor="middle" className="fill-primary text-[28px] font-black dark:fill-blue-300">
        404
      </text>
      <path
        d="M34 88c8-10 18-15 26-15s18 5 26 15"
        className="stroke-slate-300 stroke-[3] dark:stroke-slate-600"
        strokeLinecap="round"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28 sm:h-32 sm:w-32" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="54" className="fill-red-100 dark:fill-red-400/15" />
      <path
        d="M60 34v34M60 78v6"
        className="stroke-red-500 stroke-[5] [stroke-linecap:round] dark:stroke-red-400"
      />
    </svg>
  ),
};

export default function StatusPageLayout({
  variant = "notFound",
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  const illustration = illustrations[variant] || illustrations.notFound;

  return (
    <main {...mainContentProps} className="grid min-h-screen place-items-center bg-[#f5f7fb] px-6 py-16 dark:bg-slateNight">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft sm:p-10 dark:border-white/10 dark:bg-white/[0.06]">
        {illustration}
        {eyebrow && (
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </main>
  );
}

export function StatusPrimaryButton({ children, onClick, to, type = "button" }) {
  const className =
    "inline-flex items-center justify-center rounded-full bg-premium-gradient px-7 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5";

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function StatusSecondaryButton({ children, onClick, to, type = "button" }) {
  const className =
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200";

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
