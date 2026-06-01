import { describe, expect, it } from "vitest";
import { normalizeHashtag, parseHashtagParts } from "./chatHashtags.js";

describe("chatHashtags", () => {
  it("splits text into hashtag segments", () => {
    expect(parseHashtagParts("Salom #Qabul2026 va #grant")).toEqual([
      "Salom ",
      "#Qabul2026",
      " va ",
      "#grant",
    ]);
  });

  it("normalizes hashtag values", () => {
    expect(normalizeHashtag("#Qabul2026")).toBe("qabul2026");
    expect(normalizeHashtag("grant")).toBe("grant");
  });
});
