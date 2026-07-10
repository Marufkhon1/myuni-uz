import { describe, expect, it } from "vitest";
import {
  formatRateLimitMessage,
  getApiErrorMessage,
  getEmailNotVerifiedInfo,
  getRateLimitInfo,
  getReviewSubmitErrorMessage,
} from "./apiErrors.js";
import { isModerationRejectionMessage } from "@/content/reviewModerationCopy.js";

describe("getApiErrorMessage", () => {
  it("returns detail from API response", () => {
    const error = {
      response: { status: 403, data: { detail: "Avval chatga qo'shiling." } },
    };
    expect(getApiErrorMessage(error, "fallback")).toBe("Avval chatga qo'shiling.");
  });

  it("returns network hint when backend is unreachable", () => {
    const error = { code: "ERR_NETWORK" };
    expect(getApiErrorMessage(error, "fallback")).toMatch(/Backendga ulanib bo'lmadi/);
  });

  it("uses fallback when response has no known shape", () => {
    expect(getApiErrorMessage({ message: "boom" }, "Xatolik")).toBe("boom");
  });

  it("translates default DRF required field errors", () => {
    const error = {
      response: {
        status: 400,
        data: { password: ["This field is required."] },
      },
    };
    expect(getApiErrorMessage(error, "fallback")).toBe("Bu maydon to'ldirilishi shart.");
  });

  it("formats rate limit responses with retry hint", () => {
    const error = {
      response: {
        status: 429,
        data: { detail: "Juda ko'p so'rov.", retry_after_seconds: 30, code: "rate_limited" },
      },
    };
    expect(getApiErrorMessage(error, "fallback")).toMatch(/30 soniyadan keyin/);
  });

  it("prefers review text field errors for moderation rejects", () => {
    const error = {
      response: {
        status: 400,
        data: {
          text: ["Sizniki moderatsiyadan o'tmadi. Iltimos, odobli til bilan qayta yozing."],
          rating: ["This field is required."],
        },
      },
    };
    expect(getReviewSubmitErrorMessage(error, "fallback")).toMatch(/moderatsiyadan o'tmadi/);
  });
});

describe("isModerationRejectionMessage", () => {
  it("detects moderation rejection copy", () => {
    expect(isModerationRejectionMessage("Sizniki moderatsiyadan o'tmadi. Iltimos...")).toBe(true);
    expect(isModerationRejectionMessage("Backendga ulanib bo'lmadi")).toBe(false);
  });
});

describe("getRateLimitInfo", () => {
  it("extracts retry metadata from 429 responses", () => {
    const info = getRateLimitInfo({
      response: { status: 429, data: { detail: "Kuting.", retry_after_seconds: 15 } },
    });
    expect(info?.retryAfterSeconds).toBe(15);
    expect(formatRateLimitMessage(info)).toMatch(/15 soniyadan keyin/);
  });
});

describe("getEmailNotVerifiedInfo", () => {
  it("detects email_not_verified login errors", () => {
    const info = getEmailNotVerifiedInfo({
      response: {
        status: 400,
        data: { code: "email_not_verified", detail: "Tasdiqlang.", email: "a@b.c" },
      },
    });
    expect(info?.email).toBe("a@b.c");
  });
});
