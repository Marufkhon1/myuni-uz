import { describe, expect, it } from "vitest";
import { SHOW_SUPPORT_PHONE, SUPPORT_EMAIL, SUPPORT_PHONE } from "./siteContact.js";

describe("siteContact", () => {
  it("always has a support email fallback", () => {
    expect(SUPPORT_EMAIL).toContain("@");
  });

  it("hides public phone when VITE_SUPPORT_PHONE is unset (placeholder-safe)", () => {
    expect(SHOW_SUPPORT_PHONE).toBe(Boolean(SUPPORT_PHONE));
    if (!import.meta.env.VITE_SUPPORT_PHONE) {
      expect(SHOW_SUPPORT_PHONE).toBe(false);
      expect(SUPPORT_PHONE).toBe("");
    }
  });
});
