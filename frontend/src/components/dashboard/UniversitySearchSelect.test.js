import { describe, expect, it } from "vitest";
import { matchUniversityByText } from "@/utils/universityMatch.js";

const universities = [
  { id: 1, name: "Andijon davlat universiteti", short_name: "ADU", location: "Andijon" },
  { id: 2, name: "Toshkent davlat universiteti", short_name: "TDU", location: "Toshkent" },
];

describe("matchUniversityByText", () => {
  it("matches exact university name", () => {
    expect(matchUniversityByText(universities, "Andijon davlat universiteti")?.id).toBe(1);
  });

  it("matches short name", () => {
    expect(matchUniversityByText(universities, "TDU")?.id).toBe(2);
  });

  it("returns null for unknown text", () => {
    expect(matchUniversityByText(universities, "Noma'lum OTM")).toBeNull();
  });
});
