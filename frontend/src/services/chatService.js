import { api } from "./api.js";

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

export async function getUniversityMessages(universityId) {
  const { data } = await api.get(`/universities/${universityId}/messages/`);
  return data;
}

export async function sendUniversityMessage(universityId, text) {
  const { data } = await api.post(`/universities/${universityId}/messages/`, { text });
  return data;
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
  return data;
}

export async function sendDirectMessage(threadId, text) {
  const { data } = await api.post(`/universities/directs/${threadId}/messages/`, { text });
  return data;
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
