import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/myuni-logo.png";
import {
  ABOUT_NAV,
  isNavPathActive,
  PRIMARY_NAV_LINKS,
  RESOURCE_NAV_LINKS,
} from "@/config/navigation.js";
import { trackHubCta } from "@/lib/analytics.js";
import { useAuth } from "../hooks/useAuth.js";
import useFocusTrap from "../hooks/useFocusTrap.js";
import { PublicBackHomeButton, PublicLoginButton, PublicSignupButton } from "./PublicPageButtons.jsx";
import NavbarSearch from "./NavbarSearch.jsx";
import ResourcesMenu from "./ResourcesMenu.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function isDashboardPath(pathname) {
  return (
    pathname.startsWith("/applicant/dashboard") ||
    pathname.startsWith("/student/dashboard") ||
    pathname === "/moderator"
  );
}

function desktopNavLinkClass(isActive, isDark) {
  const base =
    "relative inline-flex shrink-0 items-center whitespace-nowrap px-1.5 py-1 text-[12px] font-semibold transition-colors duration-200 xl:px-2 xl:text-[13px] 2xl:text-sm";
  if (isDark) {
    if (isActive) {
      return `${base} font-bold text-white after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-sky-300`;
    }
    return `${base} text-slate-100 hover:text-white`;
  }
  if (isActive) {
    return `${base} font-bold text-primary after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary`;
  }
  return `${base} text-slate-700 hover:text-slate-950`;
}

function mobileNavLinkClass(isActive, isDark) {
  const base = "rounded-xl px-4 py-3 text-sm font-semibold transition";
  if (isDark) {
    if (isActive) {
      return `${base} bg-white/10 font-bold text-white`;
    }
    return `${base} text-slate-100 hover:bg-white/10 hover:text-white`;
  }
  if (isActive) {
    return `${base} bg-slate-100 font-bold text-slate-950`;
  }
  return `${base} text-slate-700 hover:bg-slate-50 hover:text-slate-950`;
}

export default function Navbar({ isDark = true, onToggleTheme, loginTo, signupTo, guestHomeButtonOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const { pathname } = useLocation();
  const { isAuthenticated, isLoading, role } = useAuth();
  const dashboardPath = role === "student" ? "/student/dashboard/home" : "/applicant/dashboard/home";
  const themeToggle = onToggleTheme ? () => onToggleTheme() : undefined;
  const aboutActive = isNavPathActive(pathname, ABOUT_NAV.href);

  useFocusTrap(isOpen, mobileMenuRef, {
    onEscape: () => setIsOpen(false),
    lockScroll: false,
  });

  useEffect(() => {
    setIsOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const authButtonClass =
    "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap px-5 text-sm font-bold leading-none";
  const signupButtonClass = authButtonClass;
  const navTone = isDark ? "navbar" : "navbarLight";

  function trackNav(href, source) {
    trackHubCta(href, source);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 overflow-visible border-b transition-[background-color,border-color,box-shadow] duration-300 page-top-safe ${
        isDark
          ? "border-white/10 bg-[#071533] shadow-[0_8px_24px_rgba(2,8,23,0.4)]"
          : "border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.06)]"
      }`}
    >
      <nav
        className="container-shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-x-3 sm:gap-x-4"
        aria-label="Asosiy navigatsiya"
      >
        <Link
          to="/"
          onClick={() => trackNav("/", "nav_logo")}
          className="group flex shrink-0 items-center gap-2.5 sm:gap-3"
          aria-label="MyUni.uz bosh sahifa"
        >
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl p-0.5 transition duration-200 sm:h-10 sm:w-10 ${
              isDark
                ? "bg-white ring-1 ring-white/40 shadow-[0_4px_18px_rgba(37,99,235,0.35)] group-hover:ring-white/60"
                : "bg-white ring-1 ring-slate-200/90 shadow-[0_4px_16px_rgba(37,99,235,0.18)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.24)]"
            }`}
          >
            <img src={logo} alt="" className="h-full w-full rounded-[0.6rem] object-cover" />
          </span>
          <span
            className={`whitespace-nowrap text-lg font-black tracking-tight sm:text-xl ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            MyUni.uz
          </span>
        </Link>

        <div className="hidden min-w-0 items-center justify-center gap-3 px-0.5 lg:flex xl:gap-4">
          <NavbarSearch isDark={isDark} className="w-40 xl:w-52 2xl:w-56" />
          <div className="nav-links hide-scrollbar gap-0.5 lg:gap-1 xl:gap-2">
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive = isNavPathActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => trackNav(link.href, "nav_primary")}
                  className={desktopNavLinkClass(isActive, isDark)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <ResourcesMenu isDark={isDark} pathname={pathname} />
            <Link
              to={ABOUT_NAV.href}
              onClick={() => trackNav(ABOUT_NAV.href, "nav_primary")}
              className={desktopNavLinkClass(aboutActive, isDark)}
              aria-current={aboutActive ? "page" : undefined}
            >
              {ABOUT_NAV.label}
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((value) => !value);
              setIsOpen(false);
            }}
            className={
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition lg:hidden " +
              (isDark
                ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
            }
            aria-label={mobileSearchOpen ? "Qidiruvni yopish" : "Qidiruvni ochish"}
            aria-expanded={mobileSearchOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>

          {themeToggle && (
            <ThemeToggle
              isDark={isDark}
              onToggle={themeToggle}
              variant="navbar"
              className="h-10 shrink-0"
            />
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
            onClick={() => {
              setIsOpen((value) => !value);
              setMobileSearchOpen(false);
            }}
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
        {mobileSearchOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="container-shell pb-3 lg:hidden"
          >
            <NavbarSearch
              isDark={isDark}
              className="w-full"
              onSubmitSuccess={() => setMobileSearchOpen(false)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

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
                {PRIMARY_NAV_LINKS.map((link) => {
                  const isActive = isNavPathActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => {
                        trackNav(link.href, "nav_mobile");
                        setIsOpen(false);
                      }}
                      className={mobileNavLinkClass(isActive, isDark)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <p
                  className={
                    "px-4 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.16em] " +
                    (isDark ? "text-slate-400" : "text-slate-400")
                  }
                >
                  Resurslar
                </p>
                {RESOURCE_NAV_LINKS.map((link) => {
                  const isActive = isNavPathActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => {
                        trackNav(link.href, "nav_mobile_resources");
                        setIsOpen(false);
                      }}
                      className={mobileNavLinkClass(isActive, isDark)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  to={ABOUT_NAV.href}
                  onClick={() => {
                    trackNav(ABOUT_NAV.href, "nav_mobile");
                    setIsOpen(false);
                  }}
                  className={mobileNavLinkClass(aboutActive, isDark)}
                  aria-current={aboutActive ? "page" : undefined}
                >
                  {ABOUT_NAV.label}
                </Link>
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
