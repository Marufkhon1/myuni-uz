import { describe, expect, it } from "vitest";
import {
  buildCatalogSearchParams,
  catalogFiltersEqual,
  catalogFiltersKey,
  DEFAULT_CATALOG_FILTERS,
} from "./universityCatalog.js";

describe("universityCatalog helpers", () => {
  it("builds stable filter keys regardless of field order", () => {
    const key = catalogFiltersKey({
      ...DEFAULT_CATALOG_FILTERS,
      q: "tatu",
      city: "Toshkent",
    });

    expect(key).toContain("q=tatu");
    expect(key).toContain("city=Toshkent");
  });

  it("detects equal filter objects", () => {
    const left = { ...DEFAULT_CATALOG_FILTERS, q: "tdiu" };
    const right = { ...DEFAULT_CATALOG_FILTERS, q: "tdiu" };
    expect(catalogFiltersEqual(left, right)).toBe(true);
  });

  it("omits empty values from search params", () => {
    const params = buildCatalogSearchParams(DEFAULT_CATALOG_FILTERS);
    expect(params.toString()).toBe("");
  });
});
