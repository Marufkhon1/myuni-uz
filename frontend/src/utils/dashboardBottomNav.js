/**
 * Mobile bottom bar: exactly 5 destinations.
 * Secondary destinations live under the "Yana" (more) sheet.
 */

export const DASHBOARD_BOTTOM_NAV_PRIMARY_IDS = Object.freeze([
  "home",
  "chats",
  "reviews",
  "compare",
]);

export const DASHBOARD_BOTTOM_NAV_MORE_ID = "more";

export const DASHBOARD_BOTTOM_NAV_MORE_ITEM = Object.freeze({
  id: DASHBOARD_BOTTOM_NAV_MORE_ID,
  label: "Yana",
  shortLabel: "Yana",
  helper: "Mashhur, sevimlilar va profil",
});

const PRIMARY_ID_SET = new Set(DASHBOARD_BOTTOM_NAV_PRIMARY_IDS);

/**
 * Split full cabinet menu into primary tabs (4) + overflow list for "Yana".
 * Always returns exactly 5 bar items: primary + more.
 */
export function splitDashboardBottomNavItems(menuItems = []) {
  const primary = [];
  const overflow = [];

  for (const item of menuItems) {
    if (PRIMARY_ID_SET.has(item.id)) {
      primary.push(item);
    } else if (item.id !== DASHBOARD_BOTTOM_NAV_MORE_ID) {
      overflow.push(item);
    }
  }

  // Preserve product order of primary destinations even if menu order drifts.
  const orderedPrimary = DASHBOARD_BOTTOM_NAV_PRIMARY_IDS.map((id) =>
    primary.find((item) => item.id === id)
  ).filter(Boolean);

  return {
    barItems: [...orderedPrimary, DASHBOARD_BOTTOM_NAV_MORE_ITEM],
    moreItems: overflow,
  };
}

/** True when the active section belongs in the "Yana" sheet (or is the more sentinel). */
export function isDashboardBottomNavMoreActive(activeSection, moreItems = []) {
  if (activeSection === DASHBOARD_BOTTOM_NAV_MORE_ID) {
    return true;
  }
  return moreItems.some((item) => item.id === activeSection);
}
