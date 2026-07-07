const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidUsername(value) {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function usernameValidationMessage(value) {
  const normalized = normalizeUsername(value);
  if (!normalized) {
    return "Login kiriting.";
  }
  if (!isValidUsername(normalized)) {
    return "Login 3–30 belgidan iborat bo'lishi kerak (harf, raqam, . _ -).";
  }
  return "";
}
