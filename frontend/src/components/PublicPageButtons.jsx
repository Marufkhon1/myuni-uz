import { Link } from "react-router-dom";

const defaultBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2";

const navbarBase =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1f4a] active:translate-y-0";

const styles = {
  default: {
    back: `${defaultBase} border border-slate-200 bg-white text-slate-800 shadow-soft hover:border-primary hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-primary/50`,
    login: `${defaultBase} border border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:border-primary/50 dark:hover:bg-white/15`,
    signup: `${defaultBase} bg-premium-gradient text-white shadow-glow hover:shadow-lg`,
  },
  navbar: {
    back: `${navbarBase} border border-white/30 bg-white/10 text-white shadow-none backdrop-blur-sm hover:border-white/50 hover:bg-white/15 hover:text-white`,
    login: `${navbarBase} border border-white/30 bg-white/10 text-white shadow-none backdrop-blur-sm hover:border-white/50 hover:bg-white/15 hover:text-white`,
    signup: `${navbarBase} bg-premium-gradient text-white shadow-[0_8px_28px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_32px_rgba(37,99,235,0.55)]`,
  },
};

function resolveTone(tone) {
  return styles[tone] ?? styles.default;
}

export function PublicBackHomeButton({ to = "/", className = "", tone = "default" }) {
  const toneStyles = resolveTone(tone);

  return (
    <Link to={to} className={`${toneStyles.back} ${className}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Bosh sahifa
    </Link>
  );
}

export function PublicLoginButton({ to = "/login", className = "", onClick, tone = "default" }) {
  const toneStyles = resolveTone(tone);

  return (
    <Link to={to} onClick={onClick} className={`${toneStyles.login} ${className}`}>
      Kirish
    </Link>
  );
}

export function PublicSignupButton({ to = "/signup", className = "", onClick, tone = "default" }) {
  const toneStyles = resolveTone(tone);

  return (
    <Link to={to} onClick={onClick} className={`${toneStyles.signup} ${className}`}>
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
