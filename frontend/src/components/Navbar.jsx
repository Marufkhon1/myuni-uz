import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/myuni-logo.png";
import { useAuth } from "../hooks/useAuth.js";
import useFocusTrap from "../hooks/useFocusTrap.js";
import { useLandingActiveSection } from "../hooks/useLandingActiveSection.js";
import { normalizeNavHash } from "../utils/landingNav.js";
import { scrollToLandingSection } from "../utils/landingScroll.js";
import { PublicBackHomeButton, PublicLoginButton, PublicSignupButton } from "./PublicPageButtons.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const publicRouteToHash = {
  "/universitetlar": "#universities",
  "/universitetlar/xarita": "#universities",
  "/savollar-javob": "#faq",
};

const navSectionIds = ["#home", "#how-it-works", "#universities", "#reviews", "#faq", "#about"];

function isNavLinkActive(pathname, activeHash, linkHref) {
  if (pathname === "/") {
    return normalizeNavHash(linkHref) === normalizeNavHash(activeHash);
  }
  return publicRouteToHash[pathname] === linkHref;
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

function desktopNavLinkClass(isActive, isDark) {
  const base =
    "relative inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-1.5 py-1 text-sm transition-colors duration-200 after:pointer-events-none after:absolute after:inset-x-1 after:-bottom-[0.45rem] after:h-[3px] after:rounded-full after:transition-all after:duration-200 after:content-['']";
  if (isDark) {
    if (isActive) {
      return `${base} font-bold text-white after:bg-gradient-to-r after:from-sky-300 after:via-blue-300 after:to-violet-300 after:opacity-100 after:shadow-[0_0_12px_rgba(125,211,252,0.55)]`;
    }
    return `${base} font-semibold text-white/80 hover:text-white after:scale-x-0 after:opacity-0 hover:after:scale-x-100 hover:after:bg-white/40 hover:after:opacity-70`;
  }
  if (isActive) {
    return `${base} font-bold text-slate-900 after:bg-gradient-to-r after:from-primary after:via-blue-500 after:to-violet-500 after:opacity-100`;
  }
  return `${base} font-semibold text-slate-600 hover:text-slate-900 after:scale-x-0 after:opacity-0 hover:after:scale-x-100 hover:after:bg-slate-300/70 hover:after:opacity-70`;
}

function mobileNavLinkClass(isActive, isDark) {
  const base = "rounded-2xl px-4 py-3 text-sm font-bold transition";
  if (isDark) {
    if (isActive) {
      return `${base} bg-white/12 text-white ring-1 ring-white/20`;
    }
    return `${base} text-white/80 hover:bg-white/10 hover:text-white`;
  }
  if (isActive) {
    return `${base} bg-primary/10 text-primary ring-1 ring-primary/20`;
  }
  return `${base} text-slate-700 hover:bg-slate-100 hover:text-slate-900`;
}

export default function Navbar({ isDark = true, onToggleTheme, loginTo, signupTo, guestHomeButtonOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeHash, setActiveSection } = useLandingActiveSection(navSectionIds);
  const { isAuthenticated, isLoading, role } = useAuth();
  const dashboardPath = role === "student" ? "/student/dashboard" : "/applicant/dashboard";
  const themeToggle = onToggleTheme ? () => onToggleTheme() : undefined;

  useFocusTrap(isOpen, mobileMenuRef, {
    onEscape: () => setIsOpen(false),
    lockScroll: false,
  });

  function goToLandingSection(event, targetHash) {
    event.preventDefault();
    setIsOpen(false);

    const normalized = normalizeNavHash(targetHash);
    const hashValue = normalized.replace(/^#/, "");

    if (pathname === "/") {
      setActiveSection(normalized);
      navigate({ pathname: "/", hash: hashValue }, { replace: true });
      scrollToLandingSection(normalized);
      return;
    }

    navigate({ pathname: "/", hash: hashValue });
  }

  const authButtonClass = "!min-h-9 !px-4 !py-2";
  const navTone = isDark ? "navbar" : "navbarLight";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 overflow-x-clip border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 page-top-safe ${
        isDark
          ? "border-white/10 bg-gradient-to-r from-[#06102a] via-[#0c1f4a] to-[#0a1838] shadow-[0_10px_40px_rgba(2,8,23,0.45)]"
          : "border-slate-200/80 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
      }`}
    >
      <nav
        className="container-shell flex h-14 items-center gap-3 overflow-visible pb-1 sm:h-[4.25rem] lg:gap-4"
        aria-label="Asosiy navigatsiya"
      >
        <Link
          to="/"
          onClick={() => {
            if (pathname === "/") {
              setActiveSection("#home");
            }
          }}
          className="group flex shrink-0 items-center gap-2.5 sm:gap-3"
          aria-label="MyUni.uz bosh sahifa"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/95 p-0.5 ring-1 ring-white/30 shadow-[0_4px_18px_rgba(37,99,235,0.35)] transition group-hover:ring-white/50 sm:h-10 sm:w-10">
            <img src={logo} alt="" className="h-full w-full rounded-[0.6rem] object-cover" />
          </span>
          <span
            className={`whitespace-nowrap text-lg font-black tracking-tight sm:text-xl ${isDark ? "text-white" : "text-slate-950"}`}
          >
            MyUni.uz
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-visible xl:gap-7 lg:flex 2xl:gap-9">
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(pathname, activeHash, link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => goToLandingSection(event, link.href)}
                className={desktopNavLinkClass(isActive, isDark)}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2.5 sm:gap-3 lg:flex">
          {themeToggle && (
            <ThemeToggle isDark={isDark} onToggle={themeToggle} variant="navbar" />
          )}
          {!isLoading && isAuthenticated ? (
            <Link
              to={dashboardPath}
              className={`${authButtonClass} rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 ${
                isDark
                  ? "bg-white text-slate-950 shadow-[0_8px_24px_rgba(255,255,255,0.18)] hover:bg-sky-50"
                  : "bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] hover:bg-slate-800"
              }`}
              aria-current={isDashboardPath(pathname) ? "page" : undefined}
            >
              Kabinet
            </Link>
          ) : guestHomeButtonOnly ? (
            <PublicBackHomeButton tone={navTone} className={`${authButtonClass} !shadow-none`} />
          ) : (
            <>
              <PublicLoginButton to={loginTo} tone={navTone} className={authButtonClass} />
              <PublicSignupButton to={signupTo} tone={navTone} className={authButtonClass} />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className={`ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition lg:hidden ${
            isDark
              ? "border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15"
              : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
          }`}
          aria-label={isOpen ? "Navigatsiya menyusini yopish" : "Navigatsiya menyusini ochish"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
        >
          <span className="space-y-1.5" aria-hidden="true">
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
            className="container-shell pb-4 lg:hidden"
          >
            <div
              id="mobile-nav-menu"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobil navigatsiya"
              tabIndex={-1}
              className={`rounded-2xl border p-3 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl ${
                isDark
                  ? "border-white/15 bg-[#0b1a3d]/95"
                  : "border-slate-200 bg-white/98"
              }`}
            >
              <div className="grid gap-1">
                {navLinks.map((link) => {
                  const isActive = isNavLinkActive(pathname, activeHash, link.href);
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(event) => goToLandingSection(event, link.href)}
                      className={mobileNavLinkClass(isActive, isDark)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
              <div className={`mt-3 grid gap-2 border-t pt-3 ${themeToggle ? "sm:grid-cols-3" : "sm:grid-cols-2"} ${isDark ? "border-white/10" : "border-slate-200"}`}>
                {themeToggle && (
                  <div className="flex justify-center">
                    <ThemeToggle isDark={isDark} onToggle={themeToggle} variant="navbar" />
                  </div>
                )}
                {!isLoading && isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    className={`rounded-xl px-4 py-2.5 text-center text-sm font-bold ${
                      isDark ? "bg-white text-slate-950" : "bg-slate-900 text-white"
                    }`}
                    aria-current={isDashboardPath(pathname) ? "page" : undefined}
                  >
                    Kabinet
                  </Link>
                ) : guestHomeButtonOnly ? (
                  <PublicBackHomeButton tone={navTone} className="w-full !min-h-10" />
                ) : (
                  <>
                    <PublicLoginButton to={loginTo} tone={navTone} className="w-full !min-h-10" />
                    <PublicSignupButton to={signupTo} tone={navTone} className="w-full !min-h-10" />
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
