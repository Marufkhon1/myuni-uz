import { describe, expect, it } from "vitest";
import { isValidUsername, normalizeUsername, usernameValidationMessage } from "@/utils/username.js";

describe("username utils", () => {
  it("normalizes username to lowercase", () => {
    expect(normalizeUsername(" Ali_Valiyev ")).toBe("ali_valiyev");
  });

  it("accepts valid usernames", () => {
    expect(isValidUsername("ali_valiyev")).toBe(true);
    expect(isValidUsername("student2026")).toBe(true);
  });

  it("rejects invalid usernames", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("_bad")).toBe(false);
    expect(usernameValidationMessage("ab")).toContain("3–30");
  });
});
