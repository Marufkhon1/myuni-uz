/**
 * Phase 4 i18n architecture — uz primary, ru secondary (scaffold).
 * Full RU copy migration is progressive; this module is the single source of truth
 * for locale codes, path prefixes, and hreflang wiring.
 */

export const DEFAULT_LOCALE = "uz";

export const LOCALES = Object.freeze({
  uz: {
    code: "uz",
    htmlLang: "uz",
    ogLocale: "uz_UZ",
    bcp47: "uz-UZ",
    label: "O'zbekcha",
    dir: "ltr",
    pathPrefix: "",
  },
  ru: {
    code: "ru",
    htmlLang: "ru",
    ogLocale: "ru_RU",
    bcp47: "ru-RU",
    label: "Русский",
    dir: "ltr",
    pathPrefix: "/ru",
  },
});

export const SUPPORTED_LOCALE_CODES = Object.keys(LOCALES);

/** Paths that stay locale-agnostic (auth, dashboards). */
export const LOCALE_EXEMPT_PREFIXES = [
  "/login",
  "/signup",
  "/oauth",
  "/dashboard",
  "/applicant",
  "/student",
  "/moderator",
  "/api",
];

export function isLocaleExemptPath(pathname = "/") {
  const path = String(pathname || "/");
  return LOCALE_EXEMPT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export function resolveLocaleFromPath(pathname = "/") {
  const path = String(pathname || "/");
  if (path === "/ru" || path.startsWith("/ru/")) {
    return LOCALES.ru;
  }
  return LOCALES.uz;
}

export function stripLocalePrefix(pathname = "/") {
  const path = String(pathname || "/");
  if (path === "/ru") {
    return "/";
  }
  if (path.startsWith("/ru/")) {
    return path.slice(3) || "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Build a locale-aware public path. Default (uz) has no prefix.
 * Example: localizePath('/haqida', 'ru') → '/ru/haqida'
 */
export function localizePath(pathname = "/", localeCode = DEFAULT_LOCALE) {
  if (isLocaleExemptPath(pathname)) {
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
  }
  const bare = stripLocalePrefix(pathname);
  const locale = LOCALES[localeCode] || LOCALES[DEFAULT_LOCALE];
  if (!locale.pathPrefix) {
    return bare;
  }
  if (bare === "/") {
    return locale.pathPrefix;
  }
  return `${locale.pathPrefix}${bare}`;
}

/**
 * Alternate language URLs for hreflang.
 * Phase 4 honesty: only uz pages + /ru hub (noindex scaffold). Do not invent /ru/* pages.
 */
export function buildHreflangAlternates(pathname = "/") {
  if (isLocaleExemptPath(pathname)) {
    return [];
  }
  const bare = stripLocalePrefix(pathname);
  return [
    { hreflang: "x-default", path: bare },
    { hreflang: "uz", path: bare },
    { hreflang: "ru", path: "/ru" },
  ];
}
