import { describe, expect, it } from "vitest";
import {
  KEYBOARD_OPEN_THRESHOLD_PX,
  computeKeyboardInset,
  isKeyboardOpenFromInset,
} from "@/utils/visualViewportKeyboard.js";

describe("computeKeyboardInset", () => {
  it("returns 0 when visual viewport fills the layout viewport", () => {
    expect(computeKeyboardInset(800, 800, 0)).toBe(0);
  });

  it("returns keyboard overlap when visual viewport shrinks from the bottom", () => {
    expect(computeKeyboardInset(800, 500, 0)).toBe(300);
  });

  it("accounts for iOS visualViewport.offsetTop shift", () => {
    // Layout 800, visible 500 starting 120px down → bottom inset 180
    expect(computeKeyboardInset(800, 500, 120)).toBe(180);
  });

  it("never returns negative inset", () => {
    expect(computeKeyboardInset(600, 700, 0)).toBe(0);
  });

  it("guards invalid numbers", () => {
    expect(computeKeyboardInset(NaN, 500, 0)).toBe(0);
    expect(computeKeyboardInset(800, 0, 0)).toBe(0);
    expect(computeKeyboardInset(800, -10, 0)).toBe(0);
  });
});

describe("isKeyboardOpenFromInset", () => {
  it("uses threshold so URL-bar jitter is ignored", () => {
    expect(isKeyboardOpenFromInset(KEYBOARD_OPEN_THRESHOLD_PX - 1)).toBe(false);
    expect(isKeyboardOpenFromInset(KEYBOARD_OPEN_THRESHOLD_PX)).toBe(true);
    expect(isKeyboardOpenFromInset(280)).toBe(true);
  });
});
