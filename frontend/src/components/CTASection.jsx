import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
              MyUni.uz — talabalar platformasi
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl dark:text-slate-950">
              Universitet tanlashni aniqroq qiladigan platformaga qo'shiling.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300 dark:text-slate-700">
              Profil yarating, universitet chatlariga qo'shiling, sharhlar yozing va
              talabalar hamjamiyatida qatnashing.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-full bg-white px-7 py-4 text-base font-black text-slate-950 shadow-soft transition hover:-translate-y-1 dark:bg-slate-950 dark:text-white"
              >
                Ro'yxatga qo'shilish
              </Link>
              <a
                href="#universities"
                className="rounded-full border border-white/20 px-7 py-4 text-base font-black text-white transition hover:-translate-y-1 hover:bg-white/10 dark:border-slate-950/20 dark:text-slate-950"
              >
                Universitetlarni ko'rish
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
