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
    "relative inline-flex shrink-0 items-center whitespace-nowrap px-1 py-1 text-xs font-semibold transition-colors duration-200 lg:px-1.5 lg:text-[13px] xl:px-2 xl:text-sm";
  if (isDark) {
    if (isActive) {
      return `${base} font-bold text-white`;
    }
    return `${base} text-white/70 hover:text-white`;
  }
  if (isActive) {
    return `${base} font-bold text-slate-900`;
  }
  return `${base} text-slate-500 hover:text-slate-900`;
}

function mobileNavLinkClass(isActive, isDark) {
  const base = "rounded-xl px-4 py-3 text-sm font-semibold transition";
  if (isDark) {
    if (isActive) {
      return `${base} bg-white/10 font-bold text-white`;
    }
    return `${base} text-white/80 hover:bg-white/10 hover:text-white`;
  }
  if (isActive) {
    return `${base} bg-slate-100 font-bold text-slate-900`;
  }
  return `${base} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
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

  const authButtonClass =
    "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap px-5 text-sm font-bold leading-none";
  const signupButtonClass = authButtonClass;
  const navTone = isDark ? "navbar" : "navbarLight";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 page-top-safe ${
        isDark
          ? "border-white/10 bg-[#0c1f4a]/95 shadow-[0_4px_24px_rgba(2,8,23,0.35)]"
          : "border-slate-200/80 bg-white/98 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
      }`}
    >
      <nav
        className="container-shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-x-3 sm:gap-x-4"
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
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl p-0.5 transition duration-200 sm:h-10 sm:w-10 ${
              isDark
                ? "bg-white/95 ring-1 ring-white/30 shadow-[0_4px_18px_rgba(37,99,235,0.35)] group-hover:ring-white/50"
                : "bg-white ring-1 ring-slate-200/90 shadow-[0_4px_16px_rgba(37,99,235,0.18)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.24)]"
            }`}
          >
            <img src={logo} alt="" className="h-full w-full rounded-[0.6rem] object-cover" />
          </span>
          <span
            className={`whitespace-nowrap text-lg font-black tracking-tight sm:text-xl ${isDark ? "text-white" : "text-slate-950"}`}
          >
            MyUni.uz
          </span>
        </Link>

        <div className="hidden min-w-0 items-center justify-center px-1 lg:flex">
          <div className="flex w-max items-center justify-center gap-1 lg:gap-1.5 xl:gap-2.5">
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
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
          {themeToggle && (
            <ThemeToggle isDark={isDark} onToggle={themeToggle} className="h-10 w-10 shrink-0" />
          )}

          <div className="hidden items-center gap-2 sm:gap-2.5 lg:flex">
            {!isLoading && isAuthenticated ? (
              <Link
                to={dashboardPath}
                className={
                  authButtonClass +
                  " rounded-full text-sm font-bold transition hover:-translate-y-0.5 " +
                  (isDark
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-slate-950 text-white hover:bg-slate-800")
                }
                aria-current={isDashboardPath(pathname) ? "page" : undefined}
              >
                Kabinet
              </Link>
            ) : guestHomeButtonOnly ? (
              <PublicBackHomeButton tone={navTone} className={authButtonClass + " !shadow-none"} />
            ) : (
              <>
                <PublicLoginButton to={loginTo} tone={navTone} className={authButtonClass} />
                <PublicSignupButton to={signupTo} tone={navTone} className={signupButtonClass} compact />
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className={
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition lg:hidden " +
              (isDark
                ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
            }
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
        </div>
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
              className={`rounded-2xl border p-3 shadow-lg ${
                isDark ? "border-white/10 bg-[#0c1f4a]/98" : "border-slate-200 bg-white"
              }`}
            >
              <div className="grid gap-0.5">
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
              <div
                className={`mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2 ${isDark ? "border-white/10" : "border-slate-200"}`}
              >
                {!isLoading && isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    className={`col-span-full rounded-xl px-4 py-2.5 text-center text-sm font-bold ${
                      isDark ? "bg-white text-slate-950" : "bg-slate-950 text-white"
                    }`}
                    aria-current={isDashboardPath(pathname) ? "page" : undefined}
                  >
                    Kabinet
                  </Link>
                ) : guestHomeButtonOnly ? (
                  <PublicBackHomeButton tone={navTone} className="col-span-full w-full !min-h-10" />
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
