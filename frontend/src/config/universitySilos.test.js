import { describe, expect, it } from "vitest";
import {
  buildUniversitySiloPath,
  resolveSiloFromHash,
  siloFromPathname,
  UNIVERSITY_SILOS,
} from "./universitySilos.js";

describe("universitySilos", () => {
  it("builds additive silo paths", () => {
    expect(buildUniversitySiloPath("tdiu")).toBe("/universitet/tdiu");
    expect(buildUniversitySiloPath("tdiu", "reviews")).toBe("/universitet/tdiu/sharhlari");
    expect(buildUniversitySiloPath("tdiu", "faculties")).toBe("/universitet/tdiu/fakultetlar");
    expect(buildUniversitySiloPath("tdiu", "admission")).toBe("/universitet/tdiu/qabul");
  });

  it("maps legacy hashes to silos", () => {
    expect(resolveSiloFromHash("#reviews")).toEqual(UNIVERSITY_SILOS.reviews);
    expect(resolveSiloFromHash("#programs")).toEqual(UNIVERSITY_SILOS.faculties);
    expect(resolveSiloFromHash("#admission")).toEqual(UNIVERSITY_SILOS.admission);
    expect(resolveSiloFromHash("")).toEqual(UNIVERSITY_SILOS.overview);
  });

  it("resolves silo from pathname", () => {
    expect(siloFromPathname("/universitet/tdiu").id).toBe("overview");
    expect(siloFromPathname("/universitet/tdiu/sharhlari").id).toBe("reviews");
  });
});
