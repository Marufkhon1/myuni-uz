import { describe, expect, it, vi, beforeEach } from "vitest";
import { normalizeAnalyticsPath, trackHubCta } from "./analytics.js";

describe("normalizeAnalyticsPath", () => {
  it("strips dashboard section query params from pageview path", () => {
    expect(
      normalizeAnalyticsPath(
        "/student/dashboard",
        "?section=chats&university_id=12&chat_panel=private&thread_id=5"
      )
    ).toBe("/student/dashboard");
  });

  it("keeps non-dashboard paths unchanged", () => {
    expect(normalizeAnalyticsPath("/login", "?next=%2Fdashboard")).toBe(
      "/login?next=%2Fdashboard"
    );
  });

  it("keeps unrelated dashboard query params", () => {
    expect(normalizeAnalyticsPath("/applicant/dashboard", "?section=home&foo=bar")).toBe(
      "/applicant/dashboard?foo=bar"
    );
  });

  it("preserves Phase 1 authority paths including hash for landing", () => {
    expect(normalizeAnalyticsPath("/haqida")).toBe("/haqida");
    expect(normalizeAnalyticsPath("/aloqa")).toBe("/aloqa");
    expect(normalizeAnalyticsPath("/", "", "#about")).toBe("/#about");
  });
});

describe("trackHubCta", () => {
  beforeEach(() => {
    vi.stubGlobal("plausible", undefined);
    vi.stubGlobal("gtag", undefined);
  });

  it("is a safe no-op without analytics providers", () => {
    expect(() => trackHubCta("/haqida", "landing_about")).not.toThrow();
  });
});
