import { describe, expect, it } from "vitest";
import { buildFullName, getNameInitials, splitFullName } from "./profileName.js";

describe("profileName", () => {
  it("splits and builds full name", () => {
    expect(splitFullName("Alisher Navoiy")).toEqual({ firstName: "Alisher", lastName: "Navoiy" });
    expect(splitFullName("Alisher")).toEqual({ firstName: "Alisher", lastName: "" });
    expect(buildFullName("Alisher", "Navoiy")).toBe("Alisher Navoiy");
    expect(buildFullName("Alisher", "")).toBe("Alisher");
  });

  it("returns one or two initials", () => {
    expect(getNameInitials("Alisher")).toBe("A");
    expect(getNameInitials("Alisher", "Navoiy")).toBe("AN");
    expect(getNameInitials("Alisher Navoiy")).toBe("AN");
    expect(getNameInitials("Mansurjonov Marufxon")).toBe("MM");
  });
});
