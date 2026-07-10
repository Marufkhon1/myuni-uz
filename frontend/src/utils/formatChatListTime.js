/**
 * Telegram-style chat list timestamps.
 * Today → HH:MM, yesterday → "Kecha", else → short date.
 */
export function formatChatListTime(value, now = new Date()) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday - startOfMessageDay) / 86_400_000);

  if (dayDiff === 0) {
    return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  }
  if (dayDiff === 1) {
    return "Kecha";
  }
  if (dayDiff > 1 && dayDiff < 7) {
    return date.toLocaleDateString("uz-UZ", { weekday: "short" });
  }

  return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });
}
