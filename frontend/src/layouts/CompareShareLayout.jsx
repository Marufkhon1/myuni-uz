import { Link } from "react-router-dom";
import logo from "@/assets/myuni-logo.png";
import ThemeToggle from "@/components/ThemeToggle.jsx";
import { useDarkMode } from "@/hooks/useDarkMode.js";
import { mainContentProps } from "@/utils/mainContent.js";

export function JoinMyUniButton({ className = "" }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-violet-600 px-8 py-3.5 text-sm font-black text-white shadow-[0_12px_32px_-10px_rgba(37,99,235,0.55)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_40px_-10px_rgba(37,99,235,0.65)] active:translate-y-0 ${className}`}
    >
      MyUni&apos;ga qo&apos;shilish
    </Link>
  );
}

export default function CompareShareLayout({ children, showFooter = true, seoReady = false }) {
  const { isDark, setIsDark } = useDarkMode();

  return (
    <div
      className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-950 dark:from-[#060b14] dark:via-[#0b1220] dark:to-[#060b14] dark:text-white"
      data-seo-ready={seoReady ? "true" : undefined}
      data-ssg-ready={seoReady ? "true" : undefined}
    >
      <header className="shrink-0 border-b border-slate-200/60 bg-white/70 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-[#0b1220]/80 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80 dark:ring-white/10"
            />
            <div className="min-w-0">
              <p className="text-sm font-black leading-tight">MyUni.uz</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Universitetlar taqqoslashi</p>
            </div>
          </div>
          <ThemeToggle
            isDark={isDark}
            onToggle={() => setIsDark((prev) => !prev)}
            variant="navbar"
          />
        </div>
      </header>

      <main {...mainContentProps} className="flex-1">
        {children}
      </main>

      {showFooter && (
        <footer className="shrink-0 border-t border-slate-200/60 bg-white/60 px-4 py-8 backdrop-blur dark:border-white/10 dark:bg-[#0b1220]/80 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
            <JoinMyUniButton />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sharhlar, chat va taqqoslash — bepul ro&apos;yxatdan o&apos;ting
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
