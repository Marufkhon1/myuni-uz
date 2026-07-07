import axios from "axios";
import { isGoogleOAuthCallbackPath } from "../utils/authPaths.js";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  markCookieSession,
  saveTokens,
} from "../utils/authStorage.js";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return "/api";
  }
  throw new Error(
    "VITE_API_BASE_URL is required for production builds. Set it in frontend/.env.production."
  );
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || "");

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (isGoogleOAuthCallbackPath()) {
      return Promise.reject(error);
    }

    if (requestUrl.includes("/auth/token/refresh/") || requestUrl.includes("/auth/logout/")) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();

    originalRequest._retry = true;

    try {
      const refreshBody = refresh ? { refresh } : {};
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        refreshBody,
        { withCredentials: true }
      );

      if (data.access) {
        if (refresh) {
          saveTokens({ access: data.access, refresh: data.refresh ?? refresh });
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        } else {
          markCookieSession();
          delete originalRequest.headers.Authorization;
        }
      }
      return api(originalRequest);
    } catch (refreshError) {
      if (!isGoogleOAuthCallbackPath()) {
        clearTokens();
      }
      return Promise.reject(refreshError);
    }
  }
);
