import { Link, useLocation } from "react-router-dom";
import logo from "../assets/myuni-logo.png";
import OfficeMapEmbed from "./OfficeMapEmbed.jsx";
import {
  OFFICE_ADDRESS,
  OFFICE_LATITUDE,
  OFFICE_LONGITUDE,
  OFFICE_NAME,
  SUPPORT_EMAIL,
} from "../config/siteContact.js";
import { rankingsYearPath } from "@/config/rankings.js";
import { trackHubCta } from "@/lib/analytics.js";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher.jsx";
import { scrollToLandingSection } from "../utils/landingScroll.js";
import { scrollPageToTop } from "../utils/scrollPageToTop.js";
const footerLinks = {
  Platforma: [
    { label: "Bosh sahifa", to: "/" },
    { label: "Universitetlar", to: "/universitetlar" },
    { label: "Yo'nalishlar", to: "/yo-nalishlar" },
    { label: "Reyting", to: rankingsYearPath(), trackAs: "footer_platform" },
    { label: "Taqqoslash", to: "/taqqoslash" },
    { label: "Maqolalar", to: "/maqolalar" },
    { label: "Yangiliklar", to: "/yangiliklar" },
    { label: "Stipendiyalar", to: "/stipendiyalar" },
    { label: "Qabul qo'llanmasi", to: "/qabul-qollanmasi" },
    { label: "Savollar (FAQ)", to: "/savollar-javob" },
    { label: "Sayt xaritasi", to: "/sayt-xaritasi" },
  ],
  Shaharlar: [
    { label: "Toshkent", to: "/shahar/toshkent" },
    { label: "Samarqand", to: "/shahar/samarqand" },
    { label: "Buxoro", to: "/shahar/buxoro" },
    { label: "Andijon", to: "/shahar/andijon" },
    { label: "Namangan", to: "/shahar/namangan" },
    { label: "Farg'ona", to: "/shahar/fargona" },
    { label: "Nukus", to: "/shahar/nukus" },
    { label: "Qarshi", to: "/shahar/qarshi" },
  ],
  Kompaniya: [
    { label: "Biz haqimizda", to: "/haqida" },
    { label: "Aloqa", to: "/aloqa" },
    { label: "Hamkorlar", to: "/hamkorlar" },
    { label: "Metodologiya", to: "/metodologiya" },
    { label: "Ishonch va xavfsizlik", to: "/ishonch-xavfsizlik" },
    { label: "Xato haqida xabar", to: "/xato-xabar" },
  ],
  Huquqiy: [
    { label: "Foydalanish shartlari", to: "/foydalanish-shartlari" },
    { label: "Maxfiylik siyosati", to: "/maxfiylik-siyosati" },
    { label: "Sharh qoidalari", to: "/sharh-qoidalari" },
  ],
};

function FooterLink({ link }) {
  const { pathname } = useLocation();
  const className =
    "text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-400 dark:hover:text-blue-200";

  if (link.hash) {
    const hash = link.hash.startsWith("#") ? link.hash : `#${link.hash}`;

    return (
      <Link
        to={{ pathname: link.to, hash: hash.replace("#", "") }}
        onClick={(event) => {
          if (pathname === link.to) {
            event.preventDefault();
            scrollToLandingSection(hash);
            window.history.replaceState(null, "", hash);
          }
        }}
        className={className}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <Link
      to={link.to}
      onClick={() => {
        if (link.trackAs) {
          trackHubCta(link.to, link.trackAs);
        }
        if (pathname === link.to) {
          scrollPageToTop();
        }
      }}
      className={className}
    >
      {link.label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-[max(3.5rem,calc(2.5rem+env(safe-area-inset-bottom,0px)))] pt-14 dark:border-white/10 dark:bg-slate-950">
      <div className="container-shell min-w-0">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link
              to="/"
              className="flex items-center gap-3 transition hover:opacity-90"
              aria-label="MyUni.uz bosh sahifa"
            >
              <img
                src={logo}
                alt="MyUni.uz logotipi"
                className="h-12 w-12 rounded-2xl object-cover shadow-glow"
              />
              <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                MyUni.uz
              </span>
            </Link>
            <p className="mt-5 max-w-sm leading-7 text-slate-600 dark:text-slate-300">
              Abituriyent va talabalar uchun universitetlarni real sharh,
              reyting va tajriba asosida solishtirish platformasi.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                  {title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
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
                <p>{OFFICE_ADDRESS}</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="block transition hover:text-primary dark:hover:text-blue-200"
                >
                  {SUPPORT_EMAIL}
                </a>
                <Link
                  to="/aloqa"
                  onClick={() => trackHubCta("/aloqa", "footer_contact")}
                  className="block transition hover:text-primary dark:hover:text-blue-200"
                >
                  To&apos;liq aloqa sahifasi →
                </Link>
              </address>
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-primary">
                  Ofis xaritasi
                </p>
                <OfficeMapEmbed
                  latitude={OFFICE_LATITUDE}
                  longitude={OFFICE_LONGITUDE}
                  title={OFFICE_NAME}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-slate-200 pt-8 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center dark:border-white/10 dark:text-slate-400">
          <p>© 2026 MyUni.uz. Barcha huquqlar himoyalangan.</p>
          <LocaleSwitcher />
          <p>TDIU Samarqand filiali — ta&apos;lim loyihasi</p>
        </div>
      </div>
    </footer>
  );
}
