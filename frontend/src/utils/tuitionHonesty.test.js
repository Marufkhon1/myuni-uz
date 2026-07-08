import { describe, expect, it } from "vitest";
import { resolveTuitionHonestyDisplay } from "./tuitionHonesty.js";

describe("resolveTuitionHonestyDisplay", () => {
  it("renders forms and amber badge for national estimate", () => {
    const view = resolveTuitionHonestyDisplay({
      tuition_honesty: {
        available: true,
        academic_year: "2025/2026",
        currency: "UZS",
        disclaimer_kind: "national_estimate",
        source_label: "Davlat bazaviy tarif asosida hisoblangan",
        badge_label: "Taxmin (davlat bazasi)",
        note: "Davlat note.",
        forms: [
          {
            code: "kunduzgi",
            label: "Kunduzgi",
            average_uzs: 8150000,
            min_uzs: 7400000,
            max_uzs: 8950000,
          },
        ],
      },
    });

    expect(view.available).toBe(true);
    expect(view.badgeLabel).toBe("Taxmin (davlat bazasi)");
    expect(view.tone).toBe("amber");
    expect(view.forms).toHaveLength(1);
    expect(view.forms[0].averageLabel).toContain("so'm");
    expect(view.forms[0].rangeLabel).toContain("–");
    expect(view.honestyFooter).toContain("Davlat note.");
    expect(view.methodologyHref).toContain("kontrakt-narxlari");
  });

  it("falls back to contract_pricing when tuition_honesty missing", () => {
    const view = resolveTuitionHonestyDisplay({
      contract_pricing: {
        academic_year: "2025/2026",
        forms: [{ code: "kunduzgi", label: "Kunduzgi", average_uzs: 10000000 }],
        note: "Legacy note.",
      },
    });
    expect(view.available).toBe(true);
    expect(view.forms[0].label).toBe("Kunduzgi");
    expect(view.honestyFooter).toContain("Legacy note.");
  });

  it("marks unavailable honestly", () => {
    const view = resolveTuitionHonestyDisplay({
      tuition_honesty: {
        available: false,
        disclaimer_kind: "unavailable",
        badge_label: "Mavjud emas",
        note: "Yo'q.",
        forms: [],
      },
    });
    expect(view.available).toBe(false);
    expect(view.tone).toBe("slate");
    expect(view.honestyFooter).toBe("Yo'q.");
  });

  it("exposes source link for published catalog", () => {
    const view = resolveTuitionHonestyDisplay({
      tuition_honesty: {
        available: true,
        disclaimer_kind: "published_catalog",
        badge_label: "Katalog",
        note: "Rasmiy katalog.",
        source_url: "https://kontrakt.edu.uz/",
        published_at: "2025-06-15",
        forms: [{ code: "kunduzgi", label: "Kunduzgi", average_uzs: 10500000 }],
      },
    });
    expect(view.tone).toBe("emerald");
    expect(view.badgeLabel).toBe("Katalog");
    expect(view.sourceUrl).toBe("https://kontrakt.edu.uz/");
    expect(view.publishedAt).toBe("2025-06-15");
  });
});
