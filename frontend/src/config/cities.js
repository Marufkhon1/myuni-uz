/**
 * Phase 5 — featured city landing pages (UZ regional expansion).
 * Keep in sync with backend/universities/city_pages.py
 */

export const FEATURED_CITIES = [
  { slug: "toshkent", name: "Toshkent", region: "Toshkent shahri" },
  { slug: "samarqand", name: "Samarqand", region: "Samarqand viloyati" },
  { slug: "buxoro", name: "Buxoro", region: "Buxoro viloyati" },
  { slug: "andijon", name: "Andijon", region: "Andijon viloyati" },
  { slug: "namangan", name: "Namangan", region: "Namangan viloyati" },
  { slug: "fargona", name: "Farg'ona", region: "Farg'ona viloyati" },
  { slug: "nukus", name: "Nukus", region: "Qoraqalpog'iston" },
  { slug: "qarshi", name: "Qarshi", region: "Qashqadaryo viloyati" },
];

export function buildCityPath(slug) {
  return `/shahar/${slug}`;
}

export function resolveFeaturedCity(slug) {
  const key = String(slug || "").trim().toLowerCase();
  return FEATURED_CITIES.find((city) => city.slug === key) || null;
}
