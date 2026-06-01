import { Link } from "react-router-dom";

const icons = {
  chat: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-blue-100 dark:fill-blue-400/15" />
      <path
        d="M24 30h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H34l-8 8v-8h-2a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4Z"
        className="fill-white stroke-primary stroke-[2.5] dark:fill-slate-900"
      />
      <circle cx="32" cy="41" r="2.5" className="fill-primary" />
      <circle cx="40" cy="41" r="2.5" className="fill-primary" />
      <circle cx="48" cy="41" r="2.5" className="fill-primary" />
    </svg>
  ),
  reviews: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-violet-100 dark:fill-violet-400/15" />
      <path
        d="M26 28h28l6 8v20H26V28Z"
        className="fill-white stroke-violet-600 stroke-[2.5] dark:fill-slate-900 dark:stroke-violet-400"
      />
      <path d="M26 36h34" className="stroke-violet-600 stroke-[2.5] dark:stroke-violet-400" />
      <path d="M32 46h20M32 52h14" className="stroke-slate-300 stroke-[2.5] dark:stroke-slate-500" />
      <path
        d="m44 18 3.5 7 7.8 1.1-5.6 5.5 1.3 7.7L44 36.5 38 39.3l1.3-7.7-5.6-5.5 7.8-1.1L44 18Z"
        className="fill-amber-400 stroke-amber-500 stroke-[1.5]"
      />
    </svg>
  ),
  compare: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-emerald-100 dark:fill-emerald-400/15" />
      <rect x="22" y="28" width="14" height="24" rx="4" className="fill-white stroke-emerald-600 stroke-[2.5] dark:fill-slate-900 dark:stroke-emerald-400" />
      <rect x="44" y="28" width="14" height="24" rx="4" className="fill-white stroke-emerald-600 stroke-[2.5] dark:fill-slate-900 dark:stroke-emerald-400" />
      <circle cx="40" cy="40" r="8" className="fill-emerald-500" />
      <text x="40" y="43.5" textAnchor="middle" className="fill-white text-[8px] font-black">VS</text>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-slate-100 dark:fill-white/10" />
      <circle cx="37" cy="37" r="12" className="stroke-primary stroke-[3] dark:stroke-blue-300" />
      <path d="m46 46 10 10" className="stroke-primary stroke-[3] [stroke-linecap:round] dark:stroke-blue-300" />
    </svg>
  ),
  popular: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-amber-100 dark:fill-amber-400/15" />
      <path
        d="M40 22l6.8 13.8L62 38.5 50 49.8 53.6 66 40 58.2 26.4 66 30 49.8 18 38.5l15.2-2.7L40 22Z"
        className="fill-amber-400 stroke-amber-500 stroke-[2]"
      />
    </svg>
  ),
  university: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-blue-100 dark:fill-blue-400/15" />
      <path d="M40 24 22 34v4h36v-4L40 24Z" className="fill-primary/80" />
      <rect x="26" y="38" width="8" height="16" className="fill-white stroke-primary stroke-[2] dark:fill-slate-900" />
      <rect x="36" y="38" width="8" height="16" className="fill-white stroke-primary stroke-[2] dark:fill-slate-900" />
      <rect x="46" y="38" width="8" height="16" className="fill-white stroke-primary stroke-[2] dark:fill-slate-900" />
      <path d="M20 54h40" className="stroke-primary stroke-[2.5]" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-indigo-100 dark:fill-indigo-400/15" />
      <rect x="24" y="30" width="32" height="22" rx="6" className="fill-white stroke-indigo-500 stroke-[2.5] dark:fill-slate-900 dark:stroke-indigo-400" />
      <path d="M32 52 40 46l8 6" className="stroke-indigo-500 stroke-[2.5] dark:stroke-indigo-400" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" className="fill-slate-100 dark:fill-white/10" />
      <path d="M28 30h24l-8 12v14l-8 4V42l-8-12Z" className="fill-white stroke-slate-400 stroke-[2.5] dark:fill-slate-900" />
    </svg>
  ),
};

export default function EmptyState({
  variant = "search",
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className = "",
  children,
}) {
  const paddingClass = compact ? "px-5 py-8" : "px-6 py-10 sm:px-8 sm:py-12";
  const icon = icons[variant] || icons.search;
  const actionClassName =
    "rounded-2xl bg-premium-gradient px-6 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5";
  const secondaryActionClassName =
    "rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200";

  function renderAction(actionConfig) {
    if (!actionConfig) {
      return null;
    }
    if (actionConfig.to) {
      return (
        <Link to={actionConfig.to} className={actionClassName}>
          {actionConfig.label}
        </Link>
      );
    }
    return (
      <button type="button" onClick={actionConfig.onClick} className={actionClassName}>
        {actionConfig.label}
      </button>
    );
  }

  function renderSecondaryAction(actionConfig) {
    if (!actionConfig) {
      return null;
    }
    if (actionConfig.to) {
      return (
        <Link to={actionConfig.to} className={secondaryActionClassName}>
          {actionConfig.label}
        </Link>
      );
    }
    return (
      <button type="button" onClick={actionConfig.onClick} className={secondaryActionClassName}>
        {actionConfig.label}
      </button>
    );
  }

  return (
    <div
      className={`grid place-items-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 text-center dark:border-white/10 dark:bg-white/[0.03] ${paddingClass} ${className}`}
    >
      <div className="opacity-95">{icon}</div>
      <h3 className={`mt-5 font-black text-slate-950 dark:text-white ${compact ? "text-base" : "text-lg sm:text-xl"}`}>
        {title}
      </h3>
      {description && (
        <p className={`mx-auto mt-2 max-w-md leading-6 text-slate-500 dark:text-slate-400 ${compact ? "text-sm" : "text-sm sm:text-base"}`}>
          {description}
        </p>
      )}
      {children}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {renderAction(action)}
          {renderSecondaryAction(secondaryAction)}
        </div>
      )}
    </div>
  );
}
