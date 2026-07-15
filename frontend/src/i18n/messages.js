/**
 * Phase 4 message catalogs — uz is complete for chrome; ru scaffolds nav/common.
 * Pages gradually migrate from hard-coded strings via t(key).
 */

export const messages = {
  uz: {
    "nav.home": "Bosh sahifa",
    "nav.universities": "Universitetlar",
    "nav.compare": "Taqqoslash",
    "nav.rankings": "Reyting",
    "nav.resources": "Resurslar",
    "nav.about": "Haqida",
    "nav.login": "Kirish",
    "nav.signup": "Ro'yxatdan o'tish",
    "common.methodology": "Metodologiya",
    "common.sitemap": "Sayt xaritasi",
    "locale.switch": "Til",
    "locale.uz": "O'zbekcha",
    "locale.ru": "Русский",
  },
  ru: {
    "nav.home": "Главная",
    "nav.universities": "Университеты",
    "nav.compare": "Сравнение",
    "nav.rankings": "Рейтинг",
    "nav.resources": "Ресурсы",
    "nav.about": "О нас",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "common.methodology": "Методология",
    "common.sitemap": "Карта сайта",
    "locale.switch": "Язык",
    "locale.uz": "O'zbekcha",
    "locale.ru": "Русский",
  },
};

export function translate(locale, key, fallback = key) {
  const table = messages[locale] || messages.uz;
  return table[key] || messages.uz[key] || fallback;
}
