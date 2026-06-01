import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { howItWorksSteps } from "../data/landingContent.js";
import { scrollToLandingSection } from "../utils/landingScroll.js";

function StepLink({ cta }) {
  const { pathname } = useLocation();
  const className = "landing-text-link group";

  if (cta.isRouter) {
    return (
      <Link to={cta.href} className={className}>
        {cta.label}
        <span className="transition group-hover:translate-x-0.5" aria-hidden="true">
          →
        </span>
      </Link>
    );
  }

  return (
    <a
      href={cta.href}
      className={className}
      onClick={(event) => {
        if (pathname === "/") {
          event.preventDefault();
          scrollToLandingSection(cta.href);
          window.history.replaceState(null, "", cta.href);
        }
      }}
    >
      {cta.label}
      <span className="transition group-hover:translate-x-0.5" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding bg-slate-50/80 dark:bg-slate-900/40">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Qanday ishlaydi?</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Uch qadamda to&apos;g&apos;ri universitetga yaqinlashing.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Ro&apos;yxatdan o&apos;ting, sharhlarni o&apos;qing va real talabalardan javob oling —
            hammasi bitta platformada.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 lg:grid-cols-3">
          {howItWorksSteps.map((item, index) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.08, duration: 0.55 }}
              className="landing-card group relative list-none p-6 sm:p-7"
            >
              {index < howItWorksSteps.length - 1 && (
                <span
                  className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-5 translate-x-full bg-gradient-to-r from-primary/40 to-transparent lg:block"
                  aria-hidden="true"
                />
              )}
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-premium-gradient text-sm font-black text-white shadow-glow transition group-hover:brightness-110">
                  {item.step}
                </span>
                <h3 className="text-xl font-black text-slate-950 sm:text-2xl dark:text-white">
                  {item.title}
                </h3>
              </div>
              <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/10">
                <StepLink cta={item.cta} />
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
