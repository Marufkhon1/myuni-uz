import { describe, expect, it } from "vitest";
import { readGoogleOAuthCallbackParams } from "@/utils/authPaths.js";

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
