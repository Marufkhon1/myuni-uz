import { describe, expect, it } from "vitest";
import { formatUserPresence, getPresenceDotStyle } from "./userPresence.js";

describe("formatUserPresence", () => {
  const now = new Date("2026-05-29T14:00:00.000Z");

  it("returns online label when flagged online", () => {
    expect(formatUserPresence({ isOnline: true, now })).toEqual({
      label: "Hozir online",
      isOnline: true,
    });
  });

  it("returns online label for recent last seen", () => {
    expect(
      formatUserPresence({
        isOnline: false,
        lastSeenAt: "2026-05-29T13:58:00.000Z",
        now,
      })
    ).toEqual({
      label: "Hozir online",
      isOnline: true,
    });
  });

  it("returns minutes ago label", () => {
    expect(
      formatUserPresence({
        isOnline: false,
        lastSeenAt: "2026-05-29T13:30:00.000Z",
        now,
      }).label
    ).toBe("Oxirgi marta: 30 daqiqa oldin");
  });

  it("returns not logged in label when last seen missing", () => {
    expect(formatUserPresence({ isOnline: false, now })).toEqual({
      label: "Hali tizimga kirmagan",
      isOnline: false,
    });
  });

  it("returns fallback dot style when activity unknown", () => {
    expect(getPresenceDotStyle({ isOnline: false, now }).dotClassName).toContain("slate");
  });
});
