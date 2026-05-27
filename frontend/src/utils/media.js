/** Media URL ni brauzerda ishlashi uchun (Vite /media proxy). */
export function resolveMediaUrl(url) {
  if (!url) {
    return "";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}
