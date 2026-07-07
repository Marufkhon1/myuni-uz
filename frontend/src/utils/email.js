const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

export function emailValidationMessage(value) {
  const normalized = normalizeEmail(value);
  if (!normalized) {
    return "Email kiriting.";
  }
  if (!isValidEmail(normalized)) {
    return "Email manzili noto'g'ri.";
  }
  return "";
}
