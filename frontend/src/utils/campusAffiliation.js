/** Soft campus-affiliation badge (NOT institutional verification). */

export function isCampusAffiliated(item) {
  if (!item || typeof item !== "object") {
    return false;
  }
  if (typeof item.campus_affiliated === "boolean") {
    return item.campus_affiliated;
  }
  return Boolean(item.is_verified_student);
}

export function campusAffiliationLabel(item, fallback = "Kampus ovozi") {
  if (!isCampusAffiliated(item)) {
    return null;
  }
  return item.campus_affiliation_label || fallback;
}
