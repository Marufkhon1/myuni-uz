export function isGoogleOAuthCallbackPath(pathname = "") {
  const path = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  return path === "/oauth/google/callback";
}

/** Legacy hash tokens (pre cookie-redirect). Prefer query ?ok=1. */
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

export const GOOGLE_OAUTH_NOTICE = {
  existingAccount: "existing_account",
};

export const GOOGLE_OAUTH_NOTICE_MESSAGES = {
  [GOOGLE_OAUTH_NOTICE.existingAccount]:
    "Sizda allaqachon akkaunt bor. O'sha hisobingizga kirdingiz.",
};

export function readGoogleOAuthCallbackParams(search = "") {
  const query = search || (typeof window !== "undefined" ? window.location.search : "");
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const ok = params.get("ok") === "1";
  const next = params.get("next");
  const code = params.get("code");
  const googleError = params.get("google_error");
  const googleNotice = params.get("google_notice");
  return { ok, next, code, googleError, googleNotice };
}
