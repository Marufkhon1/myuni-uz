import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { scrollToLandingSection } from "@/utils/landingScroll.js";

export default function CTASection() {
  return (
    <section id="community" className="section-padding-safe">
      <div className="container-shell min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 px-5 py-12 text-center shadow-glow sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-20 dark:bg-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.45),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.38),transparent_28%)] dark:opacity-70" />
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-blue-100 dark:bg-slate-950/10 dark:text-primary">
              Bepul · 2 daqiqa
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:mt-6 sm:text-5xl dark:text-slate-950">
              Qaroringizni ishonchli ma&apos;lumot bilan mustahkamlang.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8 dark:text-slate-700">
              Ro&apos;yxatdan o&apos;ting — sharhlar, OTM taqqoslash va guruh chatlariga kirish ochiladi.
              Moderatsiya va «Kampus ovozi» belgilari ishonchni saqlaydi.
            </p>
            <div className="mt-7 flex w-full flex-col items-center gap-3 sm:mt-9 sm:gap-4">
              <Link
                to="/signup"
                className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-black text-slate-950 shadow-soft transition hover:-translate-y-1 sm:w-auto sm:min-w-[16rem] sm:py-4 dark:bg-slate-950 dark:text-white"
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
