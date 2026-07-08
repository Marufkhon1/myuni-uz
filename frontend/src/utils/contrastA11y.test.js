import { describe, expect, it } from "vitest";
import {
  CONTRAST_TOKENS,
  WCAG_AA_NORMAL,
  contrastRatio,
} from "./contrastA11y.js";

describe("contrastA11y tokens", () => {
  it("meets WCAG AA for light muted text on white", () => {
    const ratio = contrastRatio(CONTRAST_TOKENS.light.muted, CONTRAST_TOKENS.light.surface);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it("meets WCAG AA for dark muted text on slateNight", () => {
    const ratio = contrastRatio(CONTRAST_TOKENS.dark.muted, CONTRAST_TOKENS.dark.surface);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it("meets WCAG AA for bottom-nav idle tabs (light + dark)", () => {
    expect(
      contrastRatio(CONTRAST_TOKENS.bottomNavIdleLight, CONTRAST_TOKENS.light.surface)
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    expect(
      contrastRatio(CONTRAST_TOKENS.bottomNavIdleDark, CONTRAST_TOKENS.dark.surface)
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it("rejects known low-contrast slate-400 on white", () => {
    // Historical failure mode called out in product audit.
    expect(contrastRatio("#94a3b8", "#ffffff")).toBeLessThan(WCAG_AA_NORMAL);
  });
});
