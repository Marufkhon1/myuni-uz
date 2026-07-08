import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { scrollToLandingSection } from "@/utils/landingScroll.js";

export default function CTASection() {
  return (
    <section id="community" className="section-padding">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 text-center shadow-glow sm:px-12 lg:px-20 dark:bg-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.45),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.38),transparent_28%)] dark:opacity-70" />
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-blue-100 dark:bg-slate-950/10 dark:text-primary">
              Bepul · 2 daqiqa
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl dark:text-slate-950">
              Qaroringizni ishonchli ma&apos;lumot bilan mustahkamlang.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300 dark:text-slate-700">
              Ro&apos;yxatdan o&apos;ting — sharhlar, OTM taqqoslash va guruh chatlariga kirish ochiladi.
              Moderatsiya va «Kampus ovozi» belgilari ishonchni saqlaydi.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <Link
                to="/signup"
                className="inline-flex min-w-[16rem] items-center justify-center rounded-full bg-white px-8 py-4 text-base font-black text-slate-950 shadow-soft transition hover:-translate-y-1 dark:bg-slate-950 dark:text-white"
              >
                Bepul ro&apos;yxatdan o&apos;tish
              </Link>
              <a
                href="#universities"
                className="text-sm font-bold text-blue-100/90 underline-offset-4 transition hover:text-white hover:underline dark:text-slate-600 dark:hover:text-slate-950"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToLandingSection("#universities");
                  window.history.replaceState(null, "", "#universities");
                }}
              >
                Avval katalogni ko&apos;rib chiqish
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
