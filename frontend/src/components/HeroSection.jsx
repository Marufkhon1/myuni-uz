const floatingCards = [
  { title: "Universitet tanlash", caption: "Ma'lumotlar bir joyda", position: "-left-8 top-12", delayClass: "" },
  { title: "Talaba fikri", caption: "Haqiqiy sharhlar asosida", position: "-right-7 top-28", delayClass: "hero-float-card-delay-1" },
  { title: "Hamjamiyat", caption: "Savol va javoblar uchun", position: "left-10 top-72", delayClass: "hero-float-card-delay-2" },
];

export default function HeroSection() {
  return (
    <section id="home" className="relative isolate overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.20),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.18),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.22),transparent_32%)]" />
      <div className="absolute left-1/2 top-32 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="hero-enter-left mx-auto max-w-4xl text-center lg:mx-0 lg:text-left [animation:hero-fade-up_0.7s_ease-out_both]">
          <span className="eyebrow">To'g'ri universitet, to'g'ri kelajak</span>
          <h1 className="mt-7 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Eng yaxshi universitetni haqiqiy talabalar tajribasi orqali toping
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl lg:mx-0 dark:text-slate-300">
            Universitetlarni solishtiring, ishonchli sharhlarni o'qing va kelajagingiz
            uchun muhim qaror qabul qilishdan oldin real talabalar fikrini bilib oling.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <a
              href="#universities"
              className="rounded-full bg-premium-gradient px-7 py-4 text-center text-base font-black text-white shadow-glow transition hover:-translate-y-1"
            >
              Universitetlarni ko'rish
            </a>
            <a
              href="#community"
              className="rounded-full border border-slate-200 bg-white px-7 py-4 text-center text-base font-black text-slate-900 shadow-soft transition hover:-translate-y-1 hover:border-primary dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              Hamjamiyatga qo'shilish
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
            {[
              ["14", "Jamoa a'zosi"],
              ["223", "Raqamli iqtisodiyot guruhi"],
              ["1", "Biznes loyiha"],
            ].map(([value, label]) => (
              <div key={label} className="text-center lg:text-left">
                <dt className="text-2xl font-black text-slate-950 dark:text-white">{value}</dt>
                <dd className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-enter-right relative mx-auto w-full max-w-xl [animation:hero-fade-scale_0.7s_ease-out_0.15s_both]">
          <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] bg-premium-gradient">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_22%),linear-gradient(180deg,transparent,rgba(15,23,42,0.55))]" />
              <div className="absolute left-8 top-8 rounded-3xl border border-white/25 bg-white/20 p-5 text-white backdrop-blur-xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">
                  myuni.uz
                </p>
                <p className="mt-2 text-3xl font-black">Universitet tanlash platformasi</p>
              </div>
              <div className="absolute bottom-24 right-8 grid gap-3">
                {["Sharhlar", "Universitetlar", "Hamjamiyat"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/25 bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Muhokamada
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                    Talabalar bilan qabul bo'yicha savol-javob
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
                  Jonli
                </span>
              </div>
            </div>
          </div>

          {floatingCards.map((card) => (
            <article
              key={card.title}
              className={`hero-float-card absolute hidden w-44 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/95 sm:block ${card.position} ${card.delayClass}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {card.title}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.caption}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
