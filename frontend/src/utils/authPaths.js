export function isGoogleOAuthCallbackPath(pathname = "") {
  const path = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  return path === "/oauth/google/callback";
}

export function readGoogleOAuthHashTokens() {
  if (typeof window === "undefined" || !window.location.hash) {
    return { access: null, refresh: null, next: null };
  }
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    access: params.get("access"),
    refresh: params.get("refresh"),
    next: params.get("next"),
  };
}

export function clearGoogleOAuthHash() {
  if (typeof window === "undefined") {
    return;
  }
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
}
