import { api } from "./api.js";

export async function getPublicUser(userId, { universityId } = {}) {
  const params = {};
  if (universityId != null) {
    params.university_id = universityId;
  }
  const { data } = await api.get(`/auth/users/${userId}/`, { params });
  return data;
}

export async function searchUsers(query) {
  const { data } = await api.get("/auth/users/search/", { params: { q: query } });
  return data;
}
