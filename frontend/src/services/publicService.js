import { api } from "./api.js";

function normalizeCatalogResponse(data) {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
      filters: null,
      page: 1,
      page_size: data.length,
      total_pages: 1,
      next: null,
      previous: null,
    };
  }
  return {
    count: data?.count ?? data?.results?.length ?? 0,
    results: data?.results ?? [],
    filters: data?.filters ?? null,
    page: data?.page ?? 1,
    page_size: data?.page_size ?? data?.results?.length ?? 0,
    total_pages: data?.total_pages ?? 1,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
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

/**
 * Barcha universitetlarni yig'adi (Phase 3 pagination: default 24, max 48).
 * Rankings / signup / compare kabi to'liq ro'yxat kerak bo'lgan joylar uchun.
 */
export async function getAllPublicUniversities(params = {}) {
  const pageSize = Math.min(48, Number(params.page_size) || 48);
  const base = { ...params, page_size: pageSize };
  delete base.page;

  const first = await getPublicUniversities({ ...base, page: 1 });
  const all = [...(first.results || [])];
  const totalPages = Math.max(1, first.total_pages || 1);

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await getPublicUniversities({ ...base, page });
    all.push(...(next.results || []));
  }

  return {
    count: first.count ?? all.length,
    results: all,
    filters: first.filters ?? null,
    page: 1,
    page_size: pageSize,
    total_pages: 1,
    next: null,
    previous: null,
  };
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

export async function getPublicUniversityReviews(slug, params = {}) {
  const { data } = await api.get(`/public/universities/${slug}/reviews/`, { params });
  return data;
}

export async function getPublicRelatedUniversities(slug) {
  const { data } = await api.get(`/public/universities/${slug}/related/`);
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function getPublicArticles(params = {}) {
  const { data } = await api.get("/public/articles/", { params });
  return data;
}

export async function getPublicArticleBySlug(slug, params = {}) {
  const { data } = await api.get(`/public/articles/${slug}/`, { params });
  return data;
}

export async function getPublicPrograms(params = {}) {
  const { data } = await api.get("/public/programs/", { params });
  return data;
}

export async function getPublicCityUniversities(slug, params = {}) {
  const { data } = await api.get(`/public/cities/${slug}/`, { params });
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

export async function getPublicCompareByIds(ids) {
  const normalized = Array.isArray(ids) ? ids.join(",") : String(ids);
  const { data } = await api.get("/public/compare/", { params: { ids: normalized } });
  return data;
}

export async function getPublicCompareShare(token) {
  const { data } = await api.get(`/public/compare/${token}/`);
  return data;
}
