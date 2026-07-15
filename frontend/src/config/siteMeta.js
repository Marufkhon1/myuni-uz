import { resolveArticleCoverPath } from "./articleCovers.js";

export const SITE_NAME = "MyUni.uz";
export const SITE_LOCALE = "uz_UZ";
export const TWITTER_HANDLE = "@myuniuz";

export const DEFAULT_TITLE = "MyUni.uz | Universitetlar reytingi va talabalar sharhlari";
export const DEFAULT_DESCRIPTION =
  "MyUni.uz — O'zbekiston universitetlari haqida talabalar sharhlari, reyting va tanlov uchun ochiq ma'lumot platformasi.";
export const DEFAULT_OG_IMAGE = "/images/hero/landing-campus.jpg";
export const DEFAULT_OG_IMAGE_ALT = "MyUni.uz — universitet sharhlari va reyting platformasi";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const META_DESCRIPTION_MAX = 160;

/** Production: VITE_SITE_URL=https://myuni.uz */
export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://myuni.uz";
}

export function truncateMetaDescription(value, maxLength = META_DESCRIPTION_MAX) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text || text.length <= maxLength) {
    return text || DEFAULT_DESCRIPTION;
  }
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function normalizeCanonicalPath(path = "/") {
  const raw = String(path || "/").trim();
  if (!raw || raw === "/") {
    return "/";
  }
  const withoutHash = raw.split("#")[0];
  const [pathnamePart, queryPart = ""] = withoutHash.split("?");
  const normalized = (pathnamePart.startsWith("/") ? pathnamePart : `/${pathnamePart}`).replace(
    /\/+$/,
    ""
  ) || "/";

  // Pagination SEO: faqat filtrlarsiz page>=2 ni canonicalda saqlaymiz.
  const keepPageCanonical =
    normalized === "/universitetlar" ||
    normalized === "/yo-nalishlar" ||
    /^\/universitet\/[^/]+\/sharhlari$/.test(normalized) ||
    /^\/shahar\/[^/]+$/.test(normalized);
  if (keepPageCanonical && queryPart) {
    const params = new URLSearchParams(queryPart);
    const page = Number(params.get("page"));
    const keys = [...params.keys()].filter((key) => key !== "page");
    if (keys.length === 0 && Number.isInteger(page) && page > 1) {
      return `${normalized}?page=${page}`;
    }
  }

  return normalized;
}

export function buildCanonicalUrl(path = "/") {
  const normalizedPath = normalizeCanonicalPath(path);
  const base = getSiteUrl();
  return normalizedPath === "/" ? `${base}/` : `${base}${normalizedPath}`;
}

export function resolveAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return resolveAbsoluteUrl(DEFAULT_OG_IMAGE);
  }
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = getSiteUrl();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

/** Maqola cover — localhost va productionda ishlaydigan nisbiy yo'l. */
export function resolveArticleCoverImage(coverImage, fallback, slug = "") {
  return resolveArticleCoverPath(coverImage, slug, fallback ?? DEFAULT_OG_IMAGE);
}

export function buildPageMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  type = "website",
  robots = "index, follow",
  publishedTime,
  modifiedTime,
  author = SITE_NAME,
} = {}) {
  const safeTitle = String(title || DEFAULT_TITLE).trim() || DEFAULT_TITLE;
  const safeDescription = truncateMetaDescription(description);
  const canonicalUrl = buildCanonicalUrl(path);
  const absoluteImage = resolveAbsoluteUrl(image);

  return {
    title: safeTitle,
    description: safeDescription,
    canonicalUrl,
    absoluteImage,
    imageAlt: String(imageAlt || DEFAULT_OG_IMAGE_ALT).trim() || DEFAULT_OG_IMAGE_ALT,
    type: type || "website",
    robots: robots || "index, follow",
    publishedTime: publishedTime || null,
    modifiedTime: modifiedTime || null,
    author: String(author || SITE_NAME).trim() || SITE_NAME,
  };
}

export const PAGE_META = {
  landing: {
    title: DEFAULT_TITLE,
    description:
      "Abituriyent va talabalar uchun universitetlarni real sharh, reyting va hamjamiyat orqali solishtirish platformasi.",
    path: "/",
  },
  login: {
    title: "Kirish | MyUni.uz",
    description:
      "MyUni.uz hisobingizga kiring — sharhlarni o'qing, universitetlarni taqqoslang va chatda savol bering.",
    path: "/login",
    robots: "noindex, nofollow",
  },
  signup: {
    title: "Ro'yxatdan o'tish | MyUni.uz",
    description:
      "MyUni.uz da bepul ro'yxatdan o'ting — abituriyent yoki talaba sifatida universitet tanlash va sharhlar platformasiga qo'shiling.",
    path: "/signup",
    robots: "noindex, nofollow",
  },
  forgotPassword: {
    title: "Parolni tiklash | MyUni.uz",
    description: "MyUni.uz parolingizni unutdingizmi? Email manzilingiz orqali tiklash havolasini oling.",
    path: "/forgot-password",
    robots: "noindex, nofollow",
  },
  forgotPasswordSent: {
    title: "Xat yuborildi | MyUni.uz",
    description: "Parolni tiklash havolasi email manzilingizga yuborildi.",
    path: "/forgot-password/sent",
    robots: "noindex, nofollow",
  },
  resetPassword: {
    title: "Yangi parol | MyUni.uz",
    description: "MyUni.uz hisobingiz uchun yangi parol o'rnating.",
    path: "/reset-password",
    robots: "noindex, nofollow",
  },
  notFound: {
    title: "Sahifa topilmadi | MyUni.uz",
    description: "So'ralgan sahifa topilmadi. MyUni.uz bosh sahifasiga qayting.",
    robots: "noindex, nofollow",
  },
  googleCallback: {
    title: "Google orqali kirish | MyUni.uz",
    description: "Google hisobingiz orqali MyUni.uz ga kirish jarayoni.",
    path: "/oauth/google/callback",
    robots: "noindex, nofollow",
  },
  verifyEmail: {
    title: "Email tasdiqlash | MyUni.uz",
    description: "MyUni.uz hisobingiz email manzilini tasdiqlang.",
    path: "/verify-email",
    robots: "noindex, nofollow",
  },
  verifyEmailPending: {
    title: "Email tasdiqlash kutilmoqda | MyUni.uz",
    description: "Tasdiqlash xati yuborildi. Pochtangizni tekshiring.",
    path: "/verify-email/pending",
    robots: "noindex, nofollow",
  },
  trustSafety: {
    title: "Ishonch va xavfsizlik | MyUni.uz",
    description:
      "MyUni.uz da foydalanuvchi xavfsizligi, moderatsiya, shikoyatlar va ma'lumotlaringiz himoyasi.",
    path: "/ishonch-xavfsizlik",
  },
  methodology: {
    title: "Reyting va taqqoslash metodologiyasi | MyUni.uz",
    description:
      "MyUni.uz reytingi, mezonlar va taqqoslash ballari qanday hisoblanadi — ochiq formulalar va cheklovlar. Bu vazirlik yoki QS reytingi emas.",
    path: "/metodologiya",
  },
  articlesList: {
    title: "Maqolalar | MyUni.uz",
    description:
      "Universitet tanlash, qabul, reyting va MyUni.uz platformasidan foydalanish bo'yicha foydali maqolalar.",
    path: "/maqolalar",
  },
  faqList: {
    title: "Savol-javob (FAQ) | MyUni.uz",
    description:
      "MyUni.uz platformasi, sharhlar, chat va ro'yxatdan o'tish bo'yicha ko'p so'raladigan savollar va javoblar.",
    path: "/savollar-javob",
  },
  universitiesDirectory: {
    title: "Universitetlar katalogi | MyUni.uz",
    description:
      "O'zbekiston universitetlarini shahar, turi, reyting va sharhlar bo'yicha filtrlash va qidirish.",
    path: "/universitetlar",
  },
  about: {
    title: "Biz haqimizda | MyUni.uz",
    description:
      "MyUni.uz missiyasi, qarashi, tahririy siyosati, tasdiqlash jarayoni va reyting metodologiyasi haqida.",
    path: "/haqida",
  },
  contact: {
    title: "Aloqa | MyUni.uz",
    description:
      "MyUni.uz bilan bog'laning — email, telefon, ofis manzili va xarita. Savol yoki xato xabari uchun.",
    path: "/aloqa",
  },
  rankings: {
    title: "Soft reyting | MyUni.uz",
    description:
      "MyUni soft reyting yillari indeksi — Bayesian jadval va metodologiya. Vazirlik yoki QS emas.",
    path: "/reyting",
  },
  rankingsYear: {
    title: "Yillik soft reyting | MyUni.uz",
    description:
      "MyUni.uz yillik soft reyting jadvali — kamida 3 sharhli OTMlar, Bayesian tartib. Rasmiy vazirlik reytingi emas.",
    path: "/reyting",
  },
  reportError: {
    title: "Xato haqida xabar | MyUni.uz",
    description:
      "MyUni.uz sahifa yoki ma'lumotlardagi xato haqida xabar bering — tekshiramiz va tuzatamiz.",
    path: "/xato-xabar",
  },
  htmlSitemap: {
    title: "Sayt xaritasi | MyUni.uz",
    description:
      "MyUni.uz ochiq sahifalari — universitetlar, reyting, maqolalar, yangiliklar va yordam bo'limlari.",
    path: "/sayt-xaritasi",
  },
  news: {
    title: "Yangiliklar | MyUni.uz",
    description:
      "Oliy ta'lim va MyUni.uz platformasi bo'yicha yangiliklar. Qo'llanmalar /maqolalar da.",
    path: "/yangiliklar",
  },
  scholarships: {
    title: "Stipendiyalar va grantlar | MyUni.uz",
    description:
      "O'zbekistonda grant, kontrakt va stipendiyalarni tushunish — ochiq MyUni.uz qo'llanmasi.",
    path: "/stipendiyalar",
  },
  admissionGuide: {
    title: "Qabul qo'llanmasi | MyUni.uz",
    description:
      "OTMlarga qabul: muddatlar, hujjatlar, grant/kontrakt va MyUni da qayerdan tekshirish.",
    path: "/qabul-qollanmasi",
  },
  partners: {
    title: "Hamkorlar | MyUni.uz",
    description:
      "MyUni.uz loyihasi va faol universitetlar — rasmiy sponsorlik da'vosiz ochiq tushuntirish.",
    path: "/hamkorlar",
  },
  programs: {
    title: "Yo'nalishlar katalogi | MyUni.uz",
    description:
      "O'zbekiston OTMlari yo'nalishlarini qidirish — bakalavr, magistratura va doktorantura.",
    path: "/yo-nalishlar",
  },
  cityLanding: {
    title: "Shahar universitetlari | MyUni.uz",
    description:
      "Mintaqaviy universitetlar katalogi — soft reyting, sharhlar va taqqoslash.",
    path: "/shahar",
  },
};
