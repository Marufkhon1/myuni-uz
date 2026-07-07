export const AUTH_LOGOUT_EVENT = "myuni:auth-logout";

export function dispatchAuthLogout() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new window.CustomEvent(AUTH_LOGOUT_EVENT));
  }
}
