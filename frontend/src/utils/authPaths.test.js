import { describe, expect, it } from "vitest";
import {
  buildGoogleCompleteProfilePath,
  readGoogleOAuthCallbackParams,
  userNeedsGoogleProfileSetup,
} from "@/utils/authPaths.js";

describe("readGoogleOAuthCallbackParams", () => {
  it("parses ok, code, and next from query", () => {
    expect(readGoogleOAuthCallbackParams("?ok=1&code=abc&next=%2Fstudent%2Fdashboard")).toEqual({
      ok: true,
      code: "abc",
      next: "/student/dashboard",
      googleError: null,
      googleNotice: null,
    });
  });

  it("detects google_error", () => {
    expect(readGoogleOAuthCallbackParams("?google_error=Xato")).toMatchObject({
      ok: false,
      googleError: "Xato",
    });
  });

  it("detects google_notice", () => {
    expect(readGoogleOAuthCallbackParams("?ok=1&code=abc&google_notice=existing_account")).toMatchObject({
      ok: true,
      googleNotice: "existing_account",
    });
  });
});

describe("google complete profile helpers", () => {
  it("builds complete profile path with next", () => {
    expect(buildGoogleCompleteProfilePath("/applicant/dashboard")).toBe(
      "/oauth/google/complete?next=%2Fapplicant%2Fdashboard"
    );
  });

  it("detects needs_profile_setup flag", () => {
    expect(userNeedsGoogleProfileSetup({ needs_profile_setup: true })).toBe(true);
    expect(userNeedsGoogleProfileSetup({ needs_profile_setup: false })).toBe(false);
  });
});
