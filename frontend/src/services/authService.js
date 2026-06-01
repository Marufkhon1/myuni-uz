import { api } from "./api.js";

const ACCESS_TOKEN_KEY = "myuni_access_token";
const REFRESH_TOKEN_KEY = "myuni_refresh_token";

/** Legacy: eski brauzer sessiyalari uchun; yangi login cookie orqali ishlaydi. */
export function saveTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  }
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasAccessToken() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function hasRefreshToken() {
  return Boolean(localStorage.getItem(REFRESH_TOKEN_KEY));
}

export async function establishAuthSession(tokens) {
  const { data } = await api.post("/auth/session/", tokens);
  if (data.access) {
    saveTokens({ access: data.access, refresh: data.refresh });
  }
  return data;
}

export async function logoutSession() {
  try {
    await api.post("/auth/logout/");
  } finally {
    clearTokens();
  }
}

export async function register(payload) {
  const { data } = await api.post("/auth/register/", payload);
  if (data.access) {
    saveTokens(data);
  }
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/auth/login/", payload);
  if (data.access) {
    saveTokens(data);
  }
  return data.user;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me/");
  return data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.patch("/auth/me/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteAvatar() {
  const { data } = await api.delete("/auth/me/avatar/");
  return data;
}

export async function updateProfileSettings(payload) {
  const { data } = await api.patch("/auth/me/", payload);
  return data;
}

export async function getGoogleAuthUrl(params = {}) {
  const { data } = await api.get("/auth/google/start/", { params });
  return data.authorization_url;
}

export async function fetchStreamToken() {
  const { data } = await api.post("/auth/stream-token/");
  return data.stream_token;
}

export async function requestPasswordReset(email) {
  const { data } = await api.post(
    "/auth/password-reset/",
    { email },
    { withCredentials: true }
  );
  return data;
}

export async function getPasswordResetStatus(uid, token) {
  const { data } = await api.get("/auth/password-reset/status/", {
    params: { uid, token },
  });
  return data;
}

export async function confirmPasswordReset(payload) {
  const { data } = await api.post("/auth/password-reset/confirm/", payload);
  return data;
}
