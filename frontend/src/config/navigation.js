/**
 * Ochiq sayt navigatsiya IA — Navbar/Footer uchun yagona manba.
 * Phase 1: product destinations (hash scroll yo'q).
 * Phase 2: Reyting → jonli yil jadvali (hub /reyting indeks).
 */
import { RANKINGS_PATH, rankingsYearPath } from "@/config/rankings.js";

export const PRIMARY_NAV_LINKS = [
  { label: "Universitetlar", href: "/universitetlar" },
  { label: "Reyting", href: rankingsYearPath() },
  { label: "Taqqoslash", href: "/taqqoslash" },
];

export { RANKINGS_PATH };

export const RESOURCE_NAV_LINKS = [
  { label: "Maqolalar", href: "/maqolalar", description: "Maslahat va qo'llanmalar" },
  { label: "Yangiliklar", href: "/yangiliklar", description: "Oliy ta'lim yangiliklari" },
  { label: "Yo'nalishlar", href: "/yo-nalishlar", description: "Dastur / mutaxassislik qidiruvi" },
  { label: "Stipendiyalar", href: "/stipendiyalar", description: "Grant va kontrakt qisqacha" },
  { label: "Qabul qo'llanmasi", href: "/qabul-qollanmasi", description: "Qabul bo'yicha navigatsiya" },
  { label: "Savollar", href: "/savollar-javob", description: "Ko'p so'raladigan savollar" },
  { label: "Metodologiya", href: "/metodologiya", description: "Reyting qanday hisoblanadi" },
  { label: "Hamkorlar", href: "/hamkorlar", description: "Loyiha va faol OTMlar" },
  { label: "Xato xabar", href: "/xato-xabar", description: "Ma'lumot xatosini bildirish" },
  { label: "Aloqa", href: "/aloqa", description: "Email va ofis" },
];

export const ABOUT_NAV = { label: "Haqida", href: "/haqida" };

export function isNavPathActive(pathname, href) {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }
  // Soft reyting: hub (/reyting) va har qanday yil jadvali bitta primary item.
  if (
    href === rankingsYearPath() ||
    href === RANKINGS_PATH ||
    href.startsWith(`${RANKINGS_PATH}/`)
  ) {
    return pathname === RANKINGS_PATH || pathname.startsWith(`${RANKINGS_PATH}/`);
  }
  return false;
}

export function isResourcesNavActive(pathname) {
  return RESOURCE_NAV_LINKS.some((link) => isNavPathActive(pathname, link.href));
}
