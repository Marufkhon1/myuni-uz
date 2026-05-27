import { motion } from "framer-motion";

const facts = [
  { value: "TDIU", label: "Samarqand filiali" },
  { value: "223", label: "Raqamli iqtisodiyot guruhi" },
  { value: "14", label: "Loyiha ishtirokchisi" },
  { value: "myuni.uz", label: "Loyiha brendi" },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-padding bg-slate-50/80 dark:bg-slate-900/40">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10 dark:border-white/10 dark:bg-white/[0.06]"
        >
          <div>
            <span className="eyebrow">Biz haqimizda</span>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              MyUni.uz talabalar tomonidan ishlab chiqilayotgan biznes loyiha.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Ushbu loyiha Toshkent davlat iqtisodiyot universiteti Samarqand filiali
              Raqamli iqtisodiyot 223-guruhi tomonidan tayyorlanmoqda. Maqsadimiz
              abituriyent va talabalarga universitet tanlashda real tajriba, sharh va
              foydali ma'lumotlarni qulay formatda taqdim etish.
            </p>
          </div>

          <div className="grid content-center gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
                  <p className="text-3xl font-black text-primary">{fact.value}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
