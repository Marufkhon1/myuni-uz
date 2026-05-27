import { api } from "./api.js";

export async function getUniversities() {
  const { data } = await api.get("/universities/");
  return data;
}

export async function getUniversityDetail(universityId) {
  const { data } = await api.get(`/universities/${universityId}/`);
  return data;
}

export async function getUniversityCompare(firstId, secondId) {
  const { data } = await api.get("/universities/compare/", {
    params: { ids: `${firstId},${secondId}` },
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
  const { data } = await api.post("/universities/reviews/", payload);
  return data;
}

export async function toggleReviewLike(reviewId) {
  const { data } = await api.post(`/universities/reviews/${reviewId}/like/`);
  return data;
}
