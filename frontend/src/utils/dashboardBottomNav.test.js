import { describe, expect, it } from "vitest";
import {
  DASHBOARD_BOTTOM_NAV_MORE_ID,
  DASHBOARD_BOTTOM_NAV_PRIMARY_IDS,
  isDashboardBottomNavMoreActive,
  splitDashboardBottomNavItems,
} from "./dashboardBottomNav.js";
import { getDashboardMenuItems } from "./dashboardRoleContent.js";

describe("dashboardBottomNav", () => {
  it("keeps exactly 5 bar items for applicants and students", () => {
    for (const isStudent of [false, true]) {
      const { barItems, moreItems } = splitDashboardBottomNavItems(getDashboardMenuItems(isStudent));
      expect(barItems).toHaveLength(5);
      expect(barItems.map((item) => item.id)).toEqual([
        ...DASHBOARD_BOTTOM_NAV_PRIMARY_IDS,
        DASHBOARD_BOTTOM_NAV_MORE_ID,
      ]);
      expect(moreItems.map((item) => item.id)).toEqual(["popular", "favorites", "profile"]);
    }
  });

  it("marks overflow sections as more-active", () => {
    const { moreItems } = splitDashboardBottomNavItems(getDashboardMenuItems(true));
    expect(isDashboardBottomNavMoreActive("profile", moreItems)).toBe(true);
    expect(isDashboardBottomNavMoreActive("chats", moreItems)).toBe(false);
    expect(isDashboardBottomNavMoreActive(DASHBOARD_BOTTOM_NAV_MORE_ID, moreItems)).toBe(true);
  });

  it("ignores unknown more sentinel already in menu", () => {
    const { barItems } = splitDashboardBottomNavItems([
      { id: "home", label: "Home" },
      { id: "more", label: "Bad" },
      { id: "chats", label: "Chats" },
    ]);
    expect(barItems.filter((item) => item.id === "more")).toHaveLength(1);
    expect(barItems.at(-1).label).toBe("Yana");
  });
});
