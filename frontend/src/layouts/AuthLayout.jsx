import { Link } from "react-router-dom";
import logo from "../assets/myuni-logo.png";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="container-shell grid min-h-screen items-center gap-8 py-8 sm:gap-10 sm:py-10 md:grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden md:block lg:block">
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
        </section>

        <section className="mx-auto w-full max-w-xl">
          <Link to="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img src={logo} alt="MyUni.uz logotipi" className="h-12 w-12 rounded-2xl object-cover shadow-glow" />
            <span className="text-2xl font-black">MyUni.uz</span>
          </Link>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-white/10 dark:bg-white/[0.06]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
