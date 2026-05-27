import { api } from "./api.js";

export async function getFavoriteUniversities() {
  const { data } = await api.get("/universities/favorites/");
  return data;
}

export async function addFavoriteUniversity(universityId) {
  const { data } = await api.post("/universities/favorites/", { university_id: universityId });
  return data;
}

export async function removeFavoriteUniversity(universityId) {
  const { data } = await api.delete(`/universities/favorites/${universityId}/`);
  return data;
}
