import { Link } from "react-router-dom";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition hover:-translate-y-0.5";

export function PublicBackHomeButton({ to = "/", className = "" }) {
  return (
    <Link
      to={to}
      className={`${base} border border-slate-200 bg-white text-slate-800 shadow-soft hover:border-primary hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-primary/50 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Bosh sahifa
    </Link>
  );
}

export function PublicLoginButton({ to = "/login", className = "", onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${base} border border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:border-primary/50 dark:hover:bg-white/15 ${className}`}
    >
      Kirish
    </Link>
  );
}

export function PublicSignupButton({ to = "/signup", className = "", onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${base} bg-premium-gradient text-white shadow-glow hover:shadow-lg ${className}`}
    >
      Ro&apos;yxatdan o&apos;tish
    </Link>
  );
}

export function PublicPageTopActions({ loginTo, signupTo, showAuth = true }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      <PublicBackHomeButton />
      {showAuth && (
        <>
          <PublicLoginButton to={loginTo} />
          <PublicSignupButton to={signupTo} />
        </>
      )}
    </div>
  );
}
