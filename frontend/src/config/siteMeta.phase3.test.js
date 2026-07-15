import { describe, expect, it } from "vitest";
import { normalizeCanonicalPath } from "./siteMeta.js";

describe("catalog pagination canonical", () => {
  it("keeps page>=2 only for unfiltered catalog", () => {
    expect(normalizeCanonicalPath("/universitetlar?page=2")).toBe("/universitetlar?page=2");
    expect(normalizeCanonicalPath("/universitetlar?page=1")).toBe("/universitetlar");
    expect(normalizeCanonicalPath("/universitetlar?city=Toshkent&page=3")).toBe("/universitetlar");
  });

  it("keeps page>=2 for university reviews silo", () => {
    expect(normalizeCanonicalPath("/universitet/tdiu/sharhlari?page=2")).toBe(
      "/universitet/tdiu/sharhlari?page=2"
    );
    expect(normalizeCanonicalPath("/universitet/tdiu/sharhlari?page=1")).toBe(
      "/universitet/tdiu/sharhlari"
    );
    expect(normalizeCanonicalPath("/yo-nalishlar?page=2")).toBe("/yo-nalishlar?page=2");
    expect(normalizeCanonicalPath("/yo-nalishlar?degree=master&page=2")).toBe("/yo-nalishlar");
    expect(normalizeCanonicalPath("/shahar/toshkent?page=3")).toBe("/shahar/toshkent?page=3");
  });
});
