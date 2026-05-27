import { motion } from "framer-motion";
import { features } from "../data/landingData.js";

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Abituriyentga kerak bo'lgan hamma narsa</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Ishonchli tanlov real talabalar fikridan boshlanadi.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            MyUni.uz reyting, sharh, hamjamiyat va muhokamalarni bitta zamonaviy
            platformaga jamlaydi.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: 0.55 }}
              whileHover={{ y: -8 }}
              className="glass-card group rounded-[2rem] p-6 transition"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-premium-gradient text-lg font-black text-white shadow-glow">
                {index + 1}
              </div>
              <h3 className="mt-7 text-2xl font-black text-slate-950 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
              <div className="mt-7 rounded-3xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-3xl font-black text-primary">{feature.metric}</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                  {feature.label}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
