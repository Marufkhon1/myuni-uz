import { describe, expect, it } from "vitest";
import { FEATURED_CITIES, buildCityPath, resolveFeaturedCity } from "./cities.js";

describe("Phase 5 cities config", () => {
  it("resolves featured city slugs", () => {
    expect(resolveFeaturedCity("toshkent")?.name).toBe("Toshkent");
    expect(resolveFeaturedCity("missing")).toBeNull();
    expect(buildCityPath("samarqand")).toBe("/shahar/samarqand");
    expect(FEATURED_CITIES.length).toBe(8);
  });

  it("stays aligned with backend city_pages registry", () => {
    // Mirror of backend/universities/city_pages.py FEATURED_CITY_PAGES
    const backendSlugs = [
      "toshkent",
      "samarqand",
      "buxoro",
      "andijon",
      "namangan",
      "fargona",
      "nukus",
      "qarshi",
    ];
    expect(FEATURED_CITIES.map((c) => c.slug)).toEqual(backendSlugs);
  });
});
