import { describe, expect, it } from "vitest";
import {
  ABOUT_NAV,
  isNavPathActive,
  isResourcesNavActive,
  PRIMARY_NAV_LINKS,
  RESOURCE_NAV_LINKS,
} from "./navigation.js";

describe("navigation IA", () => {
  it("includes Reyting in primary destinations as live year path", () => {
    const ranking = PRIMARY_NAV_LINKS.find((link) => link.label === "Reyting");
    expect(ranking?.href).toMatch(/^\/reyting\/\d{4}$/);
    expect(isNavPathActive("/reyting", ranking.href)).toBe(true);
    expect(isNavPathActive("/reyting/2026", ranking.href)).toBe(true);
  });

  it("keeps Phase 1 primary destinations route-based (no hash)", () => {
    for (const link of PRIMARY_NAV_LINKS) {
      expect(link.href.startsWith("/")).toBe(true);
      expect(link.href.includes("#")).toBe(false);
    }
    expect(ABOUT_NAV.href).toBe("/haqida");
  });

  it("includes Aloqa under resources, not as a hash section", () => {
    expect(RESOURCE_NAV_LINKS.some((link) => link.href === "/aloqa")).toBe(true);
    expect(isResourcesNavActive("/aloqa")).toBe(true);
    expect(isResourcesNavActive("/maqolalar/test")).toBe(true);
    expect(isResourcesNavActive("/universitetlar")).toBe(false);
  });

  it("includes Phase 5 expansion hubs in resources", () => {
    const hrefs = RESOURCE_NAV_LINKS.map((link) => link.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/yo-nalishlar",
        "/stipendiyalar",
        "/qabul-qollanmasi",
        "/hamkorlar",
      ])
    );
  });
});
