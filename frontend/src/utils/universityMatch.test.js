import { describe, expect, it } from "vitest";
import { hasMatchedUniversity, matchUniversityByText } from "./universityMatch.js";

const universities = [
  { id: 1, name: "Andijon davlat universiteti", short_name: "ADU" },
  { id: 2, name: "Toshkent davlat iqtisodiyot universiteti", short_name: "TDU" },
];

describe("matchUniversityByText", () => {
  it("matches by full name", () => {
    expect(matchUniversityByText(universities, "Andijon davlat universiteti")?.id).toBe(1);
  });

  it("matches by short name", () => {
    expect(matchUniversityByText(universities, "TDU")?.id).toBe(2);
  });

  it("returns null for unknown university", () => {
    expect(matchUniversityByText(universities, "Noma'lum OTM")).toBeNull();
  });
});

describe("hasMatchedUniversity", () => {
  it("requires a known university when the list is available", () => {
    expect(hasMatchedUniversity(universities, "TDU")).toBe(true);
    expect(hasMatchedUniversity(universities, "Fake university")).toBe(false);
  });

  it("falls back to non-empty text while the list is still loading", () => {
    expect(hasMatchedUniversity([], "TDU")).toBe(true);
    expect(hasMatchedUniversity([], "  ")).toBe(false);
  });
});
