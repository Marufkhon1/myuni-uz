import { describe, expect, it } from "vitest";
import { formatChatListTime } from "./formatChatListTime.js";

describe("formatChatListTime", () => {
  const now = new Date("2026-07-10T15:00:00");

  it("formats today as clock time", () => {
    expect(formatChatListTime("2026-07-10T09:05:00", now)).toMatch(/09:05/);
  });

  it("formats yesterday as Kecha", () => {
    expect(formatChatListTime("2026-07-09T20:00:00", now)).toBe("Kecha");
  });

  it("formats older weekdays short", () => {
    const label = formatChatListTime("2026-07-07T12:00:00", now);
    expect(label.length).toBeGreaterThan(0);
    expect(label).not.toBe("Kecha");
  });

  it("returns empty for invalid values", () => {
    expect(formatChatListTime("")).toBe("");
    expect(formatChatListTime(null)).toBe("");
    expect(formatChatListTime("not-a-date")).toBe("");
  });
});
