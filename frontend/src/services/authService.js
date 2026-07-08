import { api } from "./api.js";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  markCookieSession,
} from "../utils/authStorage.js";
import { dispatchAuthLogout } from "../utils/authEvents.js";

export { clearTokens, markCookieSession };

const LOGOUT_REQUEST_TIMEOUT_MS = 8000;



/** Cookie-session: server sets httpOnly cookies; do not persist JWT in localStorage. */

function finalizeAuthSession(data) {

  markCookieSession();

  return data;

}



export function hasAccessToken() {

  return Boolean(getAccessToken());

}



export function hasRefreshToken() {

  return Boolean(getRefreshToken());

}



export async function establishAuthSession(tokens) {

  const { data } = await api.post("/auth/session/", tokens);

  return finalizeAuthSession(data);

}



export async function exchangeAuthCode(code) {
  const { data } = await api.post(
    "/auth/exchange/",
    { code },
    { timeout: 20000 }
  );
  return finalizeAuthSession(data);
}



export async function logoutSession() {
  dispatchAuthLogout();

  try {
    await api.post("/auth/logout/", null, { timeout: LOGOUT_REQUEST_TIMEOUT_MS });
  } catch {
    // Server-side cookie clear is best-effort; local session must still end.
  } finally {
    clearTokens();
  }
}



export async function register(payload) {

  const { data } = await api.post("/auth/register/", payload);

  return finalizeAuthSession(data);

}



export async function login(payload) {
  const username = String(payload?.username ?? "").trim();
  const password = String(payload?.password ?? "");

  if (!username) {
    throw Object.assign(new Error("Login yoki email kiriting."), {
      response: { data: { username: ["Login yoki email kiriting."] } },
    });
  }
  if (!password) {
    throw Object.assign(new Error("Parol kiriting."), {
      response: { data: { password: ["Parol kiriting."] } },
    });
  }

  const { data } = await api.post(
    "/auth/login/",
    { username, password },
    { timeout: 20000 }
  );

  if (!data?.user) {
    throw Object.assign(new Error("Kirish muvaffaqiyatsiz. Qayta urinib ko'ring."), {
      response: { data: { detail: "Kirish muvaffaqiyatsiz. Qayta urinib ko'ring." } },
    });
  }

  finalizeAuthSession(data);
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

