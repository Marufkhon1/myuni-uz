import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/myuni-logo.png";
import { useAuth } from "../hooks/useAuth.js";
import useFocusTrap from "../hooks/useFocusTrap.js";
import { PublicBackHomeButton, PublicLoginButton, PublicSignupButton } from "./PublicPageButtons.jsx";
import { scrollToLandingSection } from "../utils/landingScroll.js";

function resolveLandingNavCurrent(pathname, hash, linkHref) {
  if (pathname !== "/") {
    return undefined;
  }
  const active = hash || "#home";
  if (linkHref === active) {
    return "page";
  }
  if (linkHref === "#home" && !hash) {
    return "page";
  }
  return undefined;
}

function isDashboardPath(pathname) {
  return (
    pathname.startsWith("/applicant/dashboard") ||
    pathname.startsWith("/student/dashboard") ||
    pathname === "/moderator"
  );
}

const navLinks = [
  { label: "Bosh sahifa", href: "#home" },
  { label: "Qanday ishlaydi", href: "#how-it-works" },
  { label: "Universitetlar", href: "#universities" },
  { label: "Sharhlar", href: "#reviews" },
  { label: "Savollar", href: "#faq" },
  { label: "Biz haqimizda", href: "#about" },
];

const navLinkClass =
  "rounded-lg px-1 py-0.5 text-sm font-semibold text-slate-600 transition hover:text-primary dark:text-slate-300 dark:hover:text-white";
const navLinkMobileClass =
  "rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white";

export default function Navbar({ isDark, onToggleTheme, loginTo, signupTo, guestHomeButtonOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, role } = useAuth();
  const dashboardPath = role === "student" ? "/student/dashboard" : "/applicant/dashboard";
  const themeToggle = onToggleTheme ? () => onToggleTheme() : undefined;

  useFocusTrap(isOpen, mobileMenuRef, {
    onEscape: () => setIsOpen(false),
    lockScroll: false,
  });

  function goToLandingSection(event, hash) {
    event.preventDefault();
    setIsOpen(false);

    if (pathname === "/") {
      scrollToLandingSection(hash);
      window.history.replaceState(null, "", hash);
      return;
    }

    navigate({ pathname: "/", hash });
  }

  const ThemeIcon = isDark ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-amber-400" aria-hidden="true">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1ZM12 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.41 1.42l-.71-.7a1 1 0 0 1 0-1.42ZM17.66 17.66a1 1 0 0 1 1.41 0l.71.7a1 1 0 1 1-1.42 1.42l-.7-.71a1 1 0 0 1 0-1.41ZM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1ZM19 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4.93 17.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7ZM18.36 4.22a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 0 1-1.41-1.41l.7-.71Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-700" aria-hidden="true">
      <path d="M21 14.6A8.9 8.9 0 0 1 9.4 3a.8.8 0 0 0-1-.98 10.5 10.5 0 1 0 13.58 13.58.8.8 0 0 0-.98-1Z" />
    </svg>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/70">
      <nav
        className="container-shell flex h-16 items-center justify-between sm:h-20"
        aria-label="Asosiy navigatsiya"
      >
        <Link to="/" className="flex items-center gap-3" aria-label="MyUni.uz bosh sahifa">
          <img
            src={logo}
            alt="MyUni.uz logotipi"
            className="h-11 w-11 rounded-2xl object-cover shadow-glow"
          />
          <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            MyUni.uz
          </span>
        </Link>

        <div className="hidden items-center gap-4 xl:gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => goToLandingSection(event, link.href)}
              className={navLinkClass}
              aria-current={resolveLandingNavCurrent(pathname, hash, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {themeToggle && (
          <button
            type="button"
            onClick={themeToggle}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary dark:border-white/10 dark:bg-white/10"
            aria-label="Rang rejimini almashtirish"
          >
            {ThemeIcon}
          </button>
          )}
          {!isLoading && isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-primary dark:bg-white dark:text-slate-950"
              aria-current={isDashboardPath(pathname) ? "page" : undefined}
            >
              Kabinet
            </Link>
          ) : guestHomeButtonOnly ? (
            <PublicBackHomeButton className="!min-h-10 !px-4" />
          ) : (
            <>
              <PublicLoginButton to={loginTo} className="!min-h-10 !px-4" />
              <PublicSignupButton to={signupTo} className="!min-h-10 !px-4" />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 text-slate-900 transition hover:border-primary hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:border-primary/40 dark:hover:bg-white/10 lg:hidden"
          aria-label={isOpen ? "Navigatsiya menyusini yopish" : "Navigatsiya menyusini ochish"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
        >
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="container-shell pb-5 lg:hidden"
          >
            <div
              id="mobile-nav-menu"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobil navigatsiya"
              tabIndex={-1}
              className="glass-card rounded-3xl p-4"
            >
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(event) => goToLandingSection(event, link.href)}
                    className={navLinkMobileClass}
                    aria-current={resolveLandingNavCurrent(pathname, hash, link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className={`mt-4 grid gap-3 ${themeToggle ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {themeToggle && (
                <button
                  type="button"
                  onClick={themeToggle}
                  className="grid place-items-center rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-primary hover:bg-slate-50 dark:border-white/10 dark:hover:border-primary/40 dark:hover:bg-white/10"
                  aria-label="Rang rejimini almashtirish"
                >
                  {ThemeIcon}
                </button>
                )}
                {!isLoading && isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    className="rounded-2xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                    aria-current={isDashboardPath(pathname) ? "page" : undefined}
                  >
                    Kabinet
                  </Link>
                ) : guestHomeButtonOnly ? (
                  <PublicBackHomeButton className="w-full" />
                ) : (
                  <>
                    <PublicLoginButton to={loginTo} className="w-full" />
                    <PublicSignupButton to={signupTo} className="w-full" />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
