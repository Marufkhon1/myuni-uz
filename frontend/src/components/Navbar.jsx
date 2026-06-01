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
  { label: "Savollar", href: "#faq" },
  { label: "Biz haqimizda", href: "#about" },
];

function DesktopNavLink({ link, pathname, hash, onNavigate }) {
  const isActive = resolveLandingNavCurrent(pathname, hash, link.href) === "page";

  return (
    <a
      href={link.href}
      onClick={(event) => onNavigate(event, link.href)}
      className={`nav-link ${isActive ? "nav-link-active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {link.label}
    </a>
  );
}

function MobileNavLink({ link, pathname, hash, onNavigate }) {
  const isActive = resolveLandingNavCurrent(pathname, hash, link.href) === "page";

  return (
    <a
      href={link.href}
      onClick={(event) => onNavigate(event, link.href)}
      className={`nav-link-mobile ${isActive ? "nav-link-mobile-active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {link.label}
    </a>
  );
}

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
    lockScroll: true,
  });

  function goToLandingSection(event, targetHash) {
    event.preventDefault();
    setIsOpen(false);

    if (pathname === "/") {
      scrollToLandingSection(targetHash);
      window.history.replaceState(null, "", targetHash);
      return;
    }

    navigate({ pathname: "/", hash: targetHash });
  }

  const ThemeIcon = isDark ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-amber-400" aria-hidden="true">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1ZM12 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.41 1.42l-.71-.7a1 1 0 0 1 0-1.42ZM17.66 17.66a1 1 0 0 1 1.41 0l.71.7a1 1 0 1 1-1.42 1.42l-.7-.71a1 1 0 0 1 0-1.41ZM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1ZM19 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4.93 17.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7ZM18.36 4.22a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 0 1-1.41-1.41l.7-.71Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-600" aria-hidden="true">
      <path d="M21 14.6A8.9 8.9 0 0 1 9.4 3a.8.8 0 0 0-1-.98 10.5 10.5 0 1 0 13.58 13.58.8.8 0 0 0-.98-1Z" />
    </svg>
  );

  const authActions = !isLoading && isAuthenticated ? (
    <Link
      to={dashboardPath}
      className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-primary 2xl:px-5 2xl:py-2.5 dark:bg-white dark:text-slate-950"
      aria-current={isDashboardPath(pathname) ? "page" : undefined}
    >
      Kabinet
    </Link>
  ) : guestHomeButtonOnly ? (
    <PublicBackHomeButton className="!min-h-10 !rounded-full shrink-0 !px-4 2xl:!px-5" />
  ) : (
    <>
      <PublicLoginButton to={loginTo} className="!min-h-10 shrink-0 !px-3 2xl:!px-4" />
      <PublicSignupButton
        to={signupTo}
        className="!min-h-10 shrink-0 !px-3 !text-xs 2xl:!px-4 2xl:!text-sm"
      />
    </>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl transition-colors dark:border-white/5 dark:bg-slate-950/80">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        aria-hidden="true"
      />

      <nav
        className="container-shell grid h-16 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:h-[4.75rem] xl:gap-4"
        aria-label="Asosiy navigatsiya"
      >
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 sm:gap-3"
          aria-label="MyUni.uz bosh sahifa"
        >
          <img
            src={logo}
            alt=""
            className="h-10 w-10 rounded-2xl object-cover shadow-glow transition duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
          />
          <span className="hidden text-lg font-black tracking-tight text-slate-950 min-[420px]:inline sm:text-xl dark:text-white">
            MyUni.uz
          </span>
        </Link>

        <div className="nav-links hidden min-w-0 xl:flex" aria-label="Sahifa bo'limlari">
            {navLinks.map((link) => (
              <DesktopNavLink
                key={link.href}
                link={link}
                pathname={pathname}
                hash={hash}
                onNavigate={goToLandingSection}
              />
            ))}
        </div>

        <div className="hidden shrink-0 items-center justify-end gap-2 xl:flex 2xl:gap-3">
          {themeToggle && (
            <button
              type="button"
              onClick={themeToggle}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow 2xl:h-11 2xl:w-11 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
              aria-label="Rang rejimini almashtirish"
            >
              {ThemeIcon}
            </button>
          )}
          {authActions}
        </div>

        <div className="col-start-3 flex shrink-0 items-center justify-end gap-2 xl:hidden">
          {themeToggle && (
            <button
              type="button"
              onClick={themeToggle}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200/80 bg-white shadow-soft transition hover:border-primary/40 dark:border-white/10 dark:bg-white/10"
              aria-label="Rang rejimini almashtirish"
            >
              {ThemeIcon}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-soft transition hover:border-primary/40 hover:shadow-glow dark:border-white/10 dark:bg-white/10 dark:text-white"
            aria-label={isOpen ? "Navigatsiya menyusini yopish" : "Navigatsiya menyusini ochish"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition duration-200 ${
                  isOpen ? "top-[7px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current transition duration-200 ${
                  isOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition duration-200 ${
                  isOpen ? "top-[7px] -rotate-45" : "top-[14px]"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden xl:hidden"
          >
            <div className="container-shell pb-5">
              <div
                id="mobile-nav-menu"
                ref={mobileMenuRef}
                role="dialog"
                aria-modal="true"
                aria-label="Mobil navigatsiya"
                tabIndex={-1}
                className="glass-card max-h-[min(80vh,640px)] overflow-y-auto rounded-3xl p-3 shadow-glow"
              >
                <p className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Bo&apos;limlar
                </p>
                <div className="grid gap-0.5">
                  {navLinks.map((link) => (
                    <MobileNavLink
                      key={link.href}
                      link={link}
                      pathname={pathname}
                      hash={hash}
                      onNavigate={goToLandingSection}
                    />
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200/80 dark:bg-white/10" />

                <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Hisob
                </p>
                <div className="grid grid-cols-1 gap-2.5 px-1 sm:grid-cols-2">
                  {!isLoading && isAuthenticated ? (
                    <Link
                      to={dashboardPath}
                      className="rounded-2xl bg-premium-gradient px-4 py-3 text-center text-sm font-black text-white shadow-glow sm:col-span-2"
                      aria-current={isDashboardPath(pathname) ? "page" : undefined}
                    >
                      Kabinet
                    </Link>
                  ) : guestHomeButtonOnly ? (
                    <PublicBackHomeButton className="w-full sm:col-span-2" />
                  ) : (
                    <>
                      <PublicLoginButton to={loginTo} className="w-full !rounded-2xl" />
                      <PublicSignupButton to={signupTo} className="w-full !rounded-2xl" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
