/** Chat qidiruv va ro'yxatlar uchun sana/vaqt. */
export function formatMessageSearchDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatMessageSearchTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
