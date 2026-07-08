const CSRF_COOKIE_NAME = "csrftoken";

function readCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function getCsrfToken() {
  return readCookie(CSRF_COOKIE_NAME);
}

/** True for methods that change state and need CSRF with cookie auth. */
export function isUnsafeHttpMethod(method) {
  const m = String(method || "get").toUpperCase();
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(m);
}

export function attachCsrfHeader(headers = {}) {
  const token = getCsrfToken();
  if (!token) {
    return headers;
  }
  return {
    ...headers,
    "X-CSRFToken": token,
  };
}
