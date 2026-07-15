import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  buildHreflangAlternates,
  isLocaleExemptPath,
  localizePath,
  resolveLocaleFromPath,
  stripLocalePrefix,
} from "./config.js";
import { translate } from "./messages.js";

describe("Phase 4 i18n architecture", () => {
  it("defaults to uz without prefix", () => {
    expect(DEFAULT_LOCALE).toBe("uz");
    expect(resolveLocaleFromPath("/haqida").code).toBe("uz");
    expect(localizePath("/haqida", "uz")).toBe("/haqida");
  });

  it("resolves /ru prefix", () => {
    expect(resolveLocaleFromPath("/ru").code).toBe("ru");
    expect(resolveLocaleFromPath("/ru/haqida").code).toBe("ru");
    expect(stripLocalePrefix("/ru/haqida")).toBe("/haqida");
    expect(localizePath("/haqida", "ru")).toBe("/ru/haqida");
    expect(localizePath("/", "ru")).toBe("/ru");
  });

  it("keeps auth/dashboard paths exempt", () => {
    expect(isLocaleExemptPath("/login")).toBe(true);
    expect(isLocaleExemptPath("/dashboard")).toBe(true);
    expect(localizePath("/login", "ru")).toBe("/login");
  });

  it("builds hreflang alternates without inventing /ru/* 404 paths", () => {
    const alts = buildHreflangAlternates("/metodologiya");
    expect(alts).toEqual(
      expect.arrayContaining([
        { hreflang: "x-default", path: "/metodologiya" },
        { hreflang: "uz", path: "/metodologiya" },
        { hreflang: "ru", path: "/ru" },
      ])
    );
    expect(alts.some((item) => item.path === "/ru/metodologiya")).toBe(false);
  });

  it("translates chrome keys with uz fallback", () => {
    expect(translate("uz", "nav.universities")).toBe("Universitetlar");
    expect(translate("ru", "nav.universities")).toBe("Университеты");
    expect(translate("ru", "missing.key", "x")).toBe("x");
    expect(LOCALES.ru.htmlLang).toBe("ru");
  });
});
