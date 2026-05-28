import { Link } from "react-router-dom";
import logo from "../assets/myuni-logo.png";
import { PublicBackHomeButton } from "../components/PublicPageButtons.jsx";

export default function AuthLayout({ eyebrow, title, subtitle, children, showBackHome = true }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="container-shell grid min-h-screen grid-cols-1 items-start gap-6 pb-10 pt-4 sm:gap-8 sm:pb-10 sm:pt-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10 lg:py-10">
        <section className="relative hidden lg:min-h-screen lg:block">
          {showBackHome && (
            <div className="absolute left-0 top-5 z-10 w-fit sm:top-6">
              <PublicBackHomeButton />
            </div>
          )}
          <div className="flex min-h-screen flex-col justify-center">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="MyUni.uz logotipi" className="h-14 w-14 rounded-2xl object-cover shadow-glow" />
              <span className="text-2xl font-black">MyUni.uz</span>
            </Link>
            <div className="mt-12 max-w-xl">
              <span className="eyebrow">{eyebrow}</span>
              <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            </div>
            <div className="mt-10 max-w-xl rounded-[2rem] bg-premium-gradient p-1 shadow-glow">
              <div className="rounded-[1.75rem] bg-white/90 p-6 backdrop-blur dark:bg-slate-950/80">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
                  MyUni.uz
                </p>
                <p className="mt-3 text-2xl font-black">
                  To'g'ri universitet, to'g'ri kelajak.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-xl flex-col justify-center lg:min-h-screen">
          <div
            className={`mb-4 flex items-center gap-3 lg:hidden ${showBackHome ? "justify-between" : "justify-end"}`}
          >
            {showBackHome && (
              <div className="mt-2 w-fit sm:mt-3">
                <PublicBackHomeButton />
              </div>
            )}
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img src={logo} alt="MyUni.uz logotipi" className="h-10 w-10 rounded-2xl object-cover shadow-glow" />
              <span className="text-lg font-black">MyUni.uz</span>
            </Link>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-white/10 dark:bg-white/[0.06]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
