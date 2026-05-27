import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiErrors.js";

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
});
