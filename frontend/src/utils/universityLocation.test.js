import { describe, expect, it } from "vitest";
import { resolveUniversityLocationDisplay } from "./universityLocation.js";

describe("resolveUniversityLocationDisplay", () => {
  it("marks city-level seed addresses as city without marker", () => {
    const result = resolveUniversityLocationDisplay({
      city: "Toshkent",
      location: "Toshkent",
      address: "Toshkent, O'zbekiston",
      latitude: 41.2995,
      longitude: 69.2401,
    });
    expect(result.precision).toBe("city");
    expect(result.showMap).toBe(true);
    expect(result.showMarker).toBe(false);
    expect(result.honestyLabel).toMatch(/kampus/i);
  });

  it("allows marker for street-like campus address", () => {
    const result = resolveUniversityLocationDisplay({
      city: "Toshkent",
      address: "Universitet ko'chasi 2, Toshkent",
      latitude: 41.31,
      longitude: 69.25,
    });
    expect(result.precision).toBe("campus");
    expect(result.showMarker).toBe(true);
  });

  it("hides map when coordinates missing", () => {
    const result = resolveUniversityLocationDisplay({
      city: "Samarqand",
      address: "Samarqand, O'zbekiston",
    });
    expect(result.showMap).toBe(false);
    expect(result.precision).toBe("city");
  });

  it("rejects non-finite coordinates", () => {
    const result = resolveUniversityLocationDisplay({
      latitude: "bad",
      longitude: 69.2,
      address: "Test",
    });
    expect(result.showMap).toBe(false);
  });
});
