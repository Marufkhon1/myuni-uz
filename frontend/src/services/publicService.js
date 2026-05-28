import { api } from "./api.js";

export async function getPublicUniversities() {
  const { data } = await api.get("/public/universities/");
  return data;
}

export async function getPublicTopUniversities() {
  const { data } = await api.get("/public/universities/top/");
  return data;
}

export async function getPublicRecentReviews() {
  const { data } = await api.get("/public/reviews/recent/");
  return data;
}

export async function getPublicUniversityBySlug(slug) {
  const { data } = await api.get(`/public/universities/${slug}/`);
  return data;
}
