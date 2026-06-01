import { describe, expect, it } from "vitest";
import { getDashboardCabinetEyebrow, getDashboardMenuItems } from "./dashboardRoleContent.js";

describe("dashboardRoleContent", () => {
  it("includes home as the first menu item for applicants", () => {
    const items = getDashboardMenuItems(false);

    expect(items[0]?.id).toBe("home");
    expect(items.some((item) => item.id === "chats")).toBe(true);
  });

  it("includes home as the first menu item for students", () => {
    const items = getDashboardMenuItems(true);

    expect(items[0]?.id).toBe("home");
    expect(items.some((item) => item.id === "reviews")).toBe(true);
  });

  it("returns role-specific cabinet eyebrow", () => {
    expect(getDashboardCabinetEyebrow(true)).toBe("Talaba kabineti");
    expect(getDashboardCabinetEyebrow(false)).toBe("Abituriyent kabineti");
  });
});
