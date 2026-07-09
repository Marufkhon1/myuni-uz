import { DEFAULT_OG_IMAGE } from "./siteMeta.js";

export const CAMPUS_COVER_ALIASES = {
  "/images/campuses/campus-01.jpg": "/images/hero/landing-campus.jpg",
  "/images/campuses/campus-02.jpg": "/images/universities/tdiu.jpg",
  "/images/campuses/campus-03.jpg": "/images/universities/tdtu.jpg",
  "/images/campuses/campus-04.jpg": "/images/universities/samdu.jpg",
  "/images/campuses/campus-05.jpg": "/images/universities/inha.jpg",
  "/images/campuses/campus-06.jpg": "/images/universities/tatu.jpg",
  "/images/campuses/campus-07.jpg": "/images/universities/ozmu.jpg",
  "/images/campuses/campus-08.jpg": "/images/universities/wiut.jpg",
};

export const ARTICLE_COVER_BY_SLUG = {
  "universitet-tanlashda-myuni-qanday-yordam-beradi": "/images/hero/landing-campus.jpg",
  "2026-qabul-tdiu-vs-tatu": "/images/universities/tdiu.jpg",
  "2026-qabul-tsu-vs-tdtu": "/images/universities/ozmu.jpg",
  "davlat-va-xususiy-universitet-farqi": "/images/universities/samdu.jpg",
  "myuni-da-birinchi-sharh-yozish-qollanmasi": "/images/universities/inha.jpg",
  "universitet-reytingi-nima-degani": "/images/universities/tatu.jpg",
  "toshkent-universitetlari-2026-qisqa-royxat": "/images/universities/ozmu.jpg",
  "talaba-yotoqxonasida-yashash-maslahatlari": "/images/universities/wiut.jpg",
  "myuni-chatidan-qanday-foydalanish": "/images/hero/landing-campus.jpg",
  "qabul-ballari-va-kvotalar-haqida": "/images/universities/tdiu.jpg",
  "abituriyent-universitet-tanlash-checklisti-2026": "/images/universities/tdtu.jpg",
};

function normalizeCoverPath(coverImage) {
  const raw = String(coverImage || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("/")) {
    return raw;
  }
  try {
    const { pathname } = new URL(raw);
    if (pathname.startsWith("/images/")) {
      return pathname;
    }
  } catch {
    if (raw.startsWith("images/")) {
      return `/${raw}`;
    }
  }
  return "";
}

export function resolveArticleCoverPath(coverImage, slug = "", fallback = DEFAULT_OG_IMAGE) {
  if (slug && ARTICLE_COVER_BY_SLUG[slug]) {
    return ARTICLE_COVER_BY_SLUG[slug];
  }

  const normalized = normalizeCoverPath(coverImage);
  if (normalized && CAMPUS_COVER_ALIASES[normalized]) {
    return CAMPUS_COVER_ALIASES[normalized];
  }
  if (normalized?.startsWith("/images/campuses/")) {
    return fallback;
  }
  if (normalized) {
    return normalized;
  }
  return fallback;
}
