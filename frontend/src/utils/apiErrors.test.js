import { describe, expect, it } from "vitest";
import {
  formatRateLimitMessage,
  getApiErrorMessage,
  getEmailNotVerifiedInfo,
  getRateLimitInfo,
} from "./apiErrors.js";

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

  it("formats rate limit responses with retry hint", () => {
    const error = {
      response: {
        status: 429,
        data: { detail: "Juda ko'p so'rov.", retry_after_seconds: 30, code: "rate_limited" },
      },
    };
    expect(getApiErrorMessage(error, "fallback")).toMatch(/30 soniyadan keyin/);
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
