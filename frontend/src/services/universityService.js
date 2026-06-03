import { api } from "./api.js";

export async function getUniversities() {
  const { data } = await api.get("/universities/");
  return data;
}

export async function getUniversityDetail(universityId) {
  const { data } = await api.get(`/universities/${universityId}/`);
  return data;
}

export async function createCompareShareLink(ids) {
  const idList = Array.isArray(ids) ? ids : [ids];
  const { data } = await api.post("/universities/compare/share/", {
    ids: idList.filter(Boolean).join(","),
  });
  return data;
}

export async function getUniversityCompare(ids) {
  const idList = Array.isArray(ids) ? ids : [ids];
  const { data } = await api.get("/universities/compare/", {
    params: { ids: idList.filter(Boolean).join(",") },
  });
  return data;
}

export async function getReviews(universityId) {
  const { data } = await api.get("/universities/reviews/", {
    params: universityId ? { university_id: universityId } : undefined,
  });
  return data;
}

export async function getPopularReviews() {
  const { data } = await api.get("/universities/reviews/popular/");
  return data;
}

export async function createReview(payload) {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const { data } = await api.post("/universities/reviews/", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
}

export async function updateReview(reviewId, payload) {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const { data } = await api.patch(`/universities/reviews/${reviewId}/`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
}

export async function reportReview(reviewId, payload) {
  const { data } = await api.post(`/universities/reviews/${reviewId}/report/`, payload);
  return data;
}

export async function toggleReviewLike(reviewId) {
  const { data } = await api.post(`/universities/reviews/${reviewId}/like/`);
  return data;
}

export async function deleteReview(reviewId) {
  await api.delete(`/universities/reviews/${reviewId}/`);
}
