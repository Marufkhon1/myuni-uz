import { describe, expect, it } from "vitest";
import { campusAffiliationLabel, isCampusAffiliated } from "./campusAffiliation.js";

describe("campusAffiliation", () => {
  it("prefers campus_affiliated when present", () => {
    expect(isCampusAffiliated({ campus_affiliated: true, is_verified_student: false })).toBe(true);
    expect(isCampusAffiliated({ campus_affiliated: false, is_verified_student: true })).toBe(false);
  });

  it("falls back to deprecated is_verified_student", () => {
    expect(isCampusAffiliated({ is_verified_student: true })).toBe(true);
    expect(isCampusAffiliated({})).toBe(false);
  });

  it("returns Kampus ovozi label only when affiliated", () => {
    expect(campusAffiliationLabel({ campus_affiliated: true })).toBe("Kampus ovozi");
    expect(
      campusAffiliationLabel({
        campus_affiliated: true,
        campus_affiliation_label: "Maxsus",
      })
    ).toBe("Maxsus");
    expect(campusAffiliationLabel({ campus_affiliated: false })).toBeNull();
  });
});
