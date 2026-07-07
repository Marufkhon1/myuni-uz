const ACCESS_TOKEN_KEY = "myuni_access_token";
const REFRESH_TOKEN_KEY = "myuni_refresh_token";
const LEGACY_FLAG_KEY = "myuni_legacy_token_auth";

export function saveTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(LEGACY_FLAG_KEY, "1");
  }
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(LEGACY_FLAG_KEY, "1");
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_FLAG_KEY);
}

export function hasLegacyTokenAuth() {
  return localStorage.getItem(LEGACY_FLAG_KEY) === "1";
}

export function getAccessToken() {
  if (!hasLegacyTokenAuth()) {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!hasLegacyTokenAuth()) {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function markCookieSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_FLAG_KEY);
}

export function isCookieSession() {
  return !hasLegacyTokenAuth();
}
