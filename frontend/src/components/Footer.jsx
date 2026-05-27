import logo from "../assets/myuni-logo.png";

const footerLinks = {
  Platforma: [
    { label: "Bosh sahifa", href: "#home" },
    { label: "Universitetlar", href: "#universities" },
    { label: "Sharhlar", href: "#reviews" },
    { label: "Hamjamiyat", href: "#community" },
  ],
  Loyiha: [
    { label: "Biz haqimizda", href: "#about" },
    { label: "Kirish", href: "/login" },
    { label: "Ro'yxatdan o'tish", href: "/signup" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-14 dark:border-white/10 dark:bg-slate-950">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#home" className="flex items-center gap-3" aria-label="MyUni.uz bosh sahifa">
              <img
                src={logo}
                alt="MyUni.uz logotipi"
                className="h-12 w-12 rounded-2xl object-cover shadow-glow"
              />
              <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                MyUni.uz
              </span>
            </a>
            <p className="mt-5 max-w-sm leading-7 text-slate-600 dark:text-slate-300">
              Abituriyent va talabalar uchun universitetlarni real sharh,
              reyting va tajriba asosida solishtirish platformasi.
            </p>
            <div className="mt-6 flex gap-3">
              {["Instagram", "Telegram", "LinkedIn"].map((social) => (
                <a
                  key={social}
                  href={`#${social.toLowerCase()}`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/10 dark:text-slate-300"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                  {title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-400"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                Aloqa
              </h2>
              <address className="mt-4 space-y-3 not-italic text-sm font-semibold text-slate-500 dark:text-slate-400">
                <p>Samarqand, O'zbekiston</p>
                <a href="mailto:hello@myuni.uz" className="block hover:text-primary">
                  hello@myuni.uz
                </a>
                <a href="tel:+998901234567" className="block hover:text-primary">
                  +998 90 123 45 67
                </a>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-slate-200 pt-8 text-sm font-semibold text-slate-500 sm:flex-row dark:border-white/10 dark:text-slate-400">
          <p>Copyright 2026 MyUni.uz. Barcha huquqlar himoyalangan.</p>
          <p>TDIU Samarqand filiali 223-guruh biznes loyihasi</p>
        </div>
      </div>
    </footer>
  );
}
