import { describe, expect, it } from "vitest";
import { buildMuteKey, isChatUserMuted } from "./chatMute.js";

describe("chatMute", () => {
  it("detects global and university mutes", () => {
    const keys = new Set([buildMuteKey(5, null), buildMuteKey(7, 12)]);

    expect(isChatUserMuted(keys, 5, "private")).toBe(true);
    expect(isChatUserMuted(keys, 5, "group", 12)).toBe(true);
    expect(isChatUserMuted(keys, 7, "group", 12)).toBe(true);
    expect(isChatUserMuted(keys, 7, "group", 99)).toBe(false);
    expect(isChatUserMuted(keys, 9, "private")).toBe(false);
  });
});
