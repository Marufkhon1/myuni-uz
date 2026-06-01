import { api } from "./api.js";

export async function getUniversityChatTags(universityId) {
  const { data } = await api.get(`/universities/${universityId}/tags/`);
  return data.tags ?? [];
}

export async function blockUser(userId) {
  const { data } = await api.post(`/universities/community/users/${userId}/block/`);
  return data;
}

export async function unblockUser(userId) {
  const { data } = await api.delete(`/universities/community/users/${userId}/block/`);
  return data;
}

export async function muteUser(userId, universityId = null) {
  const payload = universityId ? { university_id: universityId } : {};
  const { data } = await api.post(`/universities/community/users/${userId}/mute/`, payload);
  return data;
}

export async function unmuteUser(userId, universityId = null) {
  const payload = universityId ? { university_id: universityId } : {};
  const { data } = await api.delete(`/universities/community/users/${userId}/mute/`, {
    data: payload,
  });
  return data;
}

export async function getBlockedUsers() {
  const { data } = await api.get("/universities/community/blocked/");
  return data.blocked_users ?? [];
}
