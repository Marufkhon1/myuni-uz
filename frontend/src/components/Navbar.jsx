import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/myuni-logo.png";
import { useAuth } from "../hooks/useAuth.js";

const navLinks = [
  { label: "Bosh sahifa", href: "#home" },
  { label: "Universitetlar", href: "#universities" },
  { label: "Sharhlar", href: "#reviews" },
  { label: "Hamjamiyat", href: "#community" },
  { label: "Biz haqimizda", href: "#about" },
];

export default function Navbar({ isDark, onToggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading, role } = useAuth();
  const dashboardPath = role === "student" ? "/student/dashboard" : "/applicant/dashboard";
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
        className="container-shell flex h-20 items-center justify-between"
        aria-label="Asosiy navigatsiya"
      >
        <a href="#home" className="flex items-center gap-3" aria-label="MyUni.uz bosh sahifa">
          <img
            src={logo}
            alt="MyUni.uz logotipi"
            className="h-11 w-11 rounded-2xl object-cover shadow-glow"
          />
          <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            MyUni.uz
          </span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-primary dark:text-slate-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary dark:border-white/10 dark:bg-white/10"
            aria-label="Rang rejimini almashtirish"
          >
            {ThemeIcon}
          </button>
          {!isLoading && isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-primary dark:bg-white dark:text-slate-950"
            >
              Kabinet
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:text-primary dark:text-slate-200"
              >
                Kirish
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-primary dark:bg-white dark:text-slate-950"
              >
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 text-slate-900 lg:hidden dark:border-white/10 dark:text-white"
          aria-label="Navigatsiya menyusini ochish"
          aria-expanded={isOpen}
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
            <div className="glass-card rounded-3xl p-4">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="grid place-items-center rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10"
                  aria-label="Rang rejimini almashtirish"
                >
                  {ThemeIcon}
                </button>
                {!isLoading && isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    className="rounded-2xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Kabinet
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="rounded-2xl px-4 py-3 text-center text-sm font-bold">
                      Kirish
                    </Link>
                    <Link
                      to="/signup"
                      className="rounded-2xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Ro'yxatdan o'tish
                    </Link>
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
