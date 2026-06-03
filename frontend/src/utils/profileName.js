/** To'liq ismni ism + familiyaga ajratish. */
export function splitFullName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/** Ism va ixtiyoriy familiyadan to'liq ism. */
export function buildFullName(firstName, lastName) {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();
  if (!first) {
    return last;
  }
  return last ? `${first} ${last}` : first;
}

/**
 * Avatar bosh harflari:
 * - faqat ism → 1 harf (A)
 * - ism + familiya → 2 harf (AN)
 */
export function getNameInitials(nameOrFirst, lastName) {
  if (typeof lastName === "string") {
    const first = (nameOrFirst || "").trim();
    const last = lastName.trim();
    if (!first && !last) {
      return "?";
    }
    if (!last) {
      return first.slice(0, 1).toUpperCase();
    }
    return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
  }

  const { firstName, lastName: familyName } = splitFullName(nameOrFirst);
  return getNameInitials(firstName, familyName);
}
