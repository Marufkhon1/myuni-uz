import { api } from "./api.js";

function normalizeCatalogResponse(data) {
  if (Array.isArray(data)) {
    return { count: data.length, results: data, filters: null };
  }
  return {
    count: data?.count ?? data?.results?.length ?? 0,
    results: data?.results ?? [],
    filters: data?.filters ?? null,
  };
}

/** Eski array va yangi `{ results }` javoblarini qo'llab-quvvatlaydi. */
export function unwrapUniversityList(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results ?? [];
}

export async function getPublicUniversities(params) {
  const { data } = await api.get("/public/universities/", { params });
  return normalizeCatalogResponse(data);
}

export async function getPublicUniversityCatalog(params) {
  return getPublicUniversities(params);
}

export async function getPublicUniversityFilters() {
  const { data } = await api.get("/public/universities/filters/");
  return data;
}

export async function getPublicTopUniversities() {
  const { data } = await api.get("/public/universities/top/");
  return data;
}

export async function getPublicRecentReviews(params = {}) {
  const query =
    typeof params === "number"
      ? { limit: params }
      : params && typeof params === "object"
        ? params
        : {};
  const { data } = await api.get("/public/reviews/recent/", { params: query });
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function getPublicTopUniversityReviews(limit = 3) {
  const { data } = await api.get("/public/reviews/top-universities/", { params: { limit } });
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function getPublicReviewFilters() {
  const { data } = await api.get("/public/reviews/filters/");
  return data;
}

export async function getPublicFeaturedUniversities(limit = 12) {
  const { data } = await api.get("/public/universities/featured/", { params: { limit } });
  return data;
}

export async function getPublicPlatformStats() {
  const { data } = await api.get("/public/stats/");
  return data;
}

export async function getPublicLandingPreview() {
  const { data } = await api.get("/public/landing-preview/");
  return data;
}

export async function getPublicUniversityBySlug(slug) {
  const { data } = await api.get(`/public/universities/${slug}/`);
  return data;
}

export async function getPublicArticles() {
  const { data } = await api.get("/public/articles/");
  return data;
}

export async function getPublicArticleBySlug(slug) {
  const { data } = await api.get(`/public/articles/${slug}/`);
  return data;
}

export async function getPublicFaqItems() {
  const { data } = await api.get("/public/faq/");
  return data;
}

export async function getPublicFaqDetail(slug) {
  const { data } = await api.get(`/public/faq/${slug}/`);
  return data;
}

export async function getPublicCompareShare(token) {
  const { data } = await api.get(`/public/compare/${token}/`);
  return data;
}
