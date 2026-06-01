import { api } from "./api.js";

function normalizeMessageListResponse(data) {
  if (Array.isArray(data)) {
    return { messages: data, pinned: null };
  }
  return {
    messages: data?.messages ?? [],
    pinned: data?.pinned ?? null,
  };
}

export async function getJoinedUniversityIds() {
  const { data } = await api.get("/universities/joined/");
  return data.university_ids ?? [];
}

export async function getUniversityMembers(universityId) {
  const { data } = await api.get(`/universities/${universityId}/members/`);
  return data;
}

export async function joinUniversity(universityId) {
  const { data } = await api.post(`/universities/${universityId}/join/`);
  return data;
}

export async function getUniversityMessages(universityId, { tag } = {}) {
  const params = tag ? { tag } : undefined;
  const { data } = await api.get(`/universities/${universityId}/messages/`, { params });
  return normalizeMessageListResponse(data);
}

export async function sendUniversityMessage(universityId, text) {
  const { data } = await api.post(`/universities/${universityId}/messages/`, { text });
  return data;
}

export async function pinUniversityMessage(universityId, messageId) {
  const { data } = await api.post(
    `/universities/${universityId}/messages/${messageId}/pin/`
  );
  return data.pinned;
}

export async function unpinUniversityMessage(universityId, messageId) {
  await api.delete(`/universities/${universityId}/messages/${messageId}/pin/`);
}

export async function getDirectThreads() {
  const { data } = await api.get("/universities/directs/");
  return data;
}

export async function startDirectThread(userId) {
  const { data } = await api.post("/universities/directs/", { user_id: userId });
  return data;
}

export async function getDirectMessages(threadId) {
  const { data } = await api.get(`/universities/directs/${threadId}/messages/`);
  return normalizeMessageListResponse(data);
}

export async function sendDirectMessage(threadId, text) {
  const { data } = await api.post(`/universities/directs/${threadId}/messages/`, { text });
  return data;
}

export async function pinDirectMessage(threadId, messageId) {
  const { data } = await api.post(
    `/universities/directs/${threadId}/messages/${messageId}/pin/`
  );
  return data.pinned;
}

export async function unpinDirectMessage(threadId, messageId) {
  await api.delete(`/universities/directs/${threadId}/messages/${messageId}/pin/`);
}

export async function markUniversityChatRead(universityId) {
  const { data } = await api.post(`/universities/${universityId}/read/`);
  return data;
}

export async function markDirectThreadRead(threadId) {
  const { data } = await api.post(`/universities/directs/${threadId}/read/`);
  return data;
}

export async function leaveUniversityChat(universityId) {
  const { data } = await api.delete(`/universities/${universityId}/leave/`);
  return data;
}

export async function editUniversityMessage(messageId, text) {
  const { data } = await api.patch(`/universities/messages/${messageId}/edit/`, { text });
  return data;
}

export async function editDirectMessage(messageId, text) {
  const { data } = await api.patch(`/universities/directs/messages/${messageId}/edit/`, { text });
  return data;
}

export async function deleteUniversityMessage(messageId) {
  await api.delete(`/universities/messages/${messageId}/`);
}

export async function deleteDirectMessage(messageId) {
  await api.delete(`/universities/directs/messages/${messageId}/`);
}

export async function reactToUniversityMessage(messageId, emoji) {
  const { data } = await api.post(`/universities/messages/${messageId}/reactions/`, { emoji });
  return data;
}

export async function reactToDirectMessage(messageId, emoji) {
  const { data } = await api.post(`/universities/directs/messages/${messageId}/reactions/`, { emoji });
  return data;
}

export async function sendUniversityTyping(universityId) {
  await api.post(`/universities/${universityId}/typing/`);
}

export async function sendDirectTyping(threadId) {
  await api.post(`/universities/directs/${threadId}/typing/`);
}

export async function reportUniversityMessage(messageId, payload) {
  const { data } = await api.post(`/universities/messages/${messageId}/report/`, payload);
  return data;
}

export async function reportDirectMessage(messageId, payload) {
  const { data } = await api.post(`/universities/directs/messages/${messageId}/report/`, payload);
  return data;
}
