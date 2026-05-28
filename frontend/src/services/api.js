import axios from "axios";

const ACCESS_TOKEN_KEY = "myuni_access_token";
const REFRESH_TOKEN_KEY = "myuni_refresh_token";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return "/api";
  }
  return "http://127.0.0.1:8000/api";
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        refresh ? { refresh } : {},
        { withCredentials: true }
      );

      if (data.access) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return Promise.reject(refreshError);
    }
  }
);
