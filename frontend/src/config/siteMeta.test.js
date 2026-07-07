import { describe, expect, it } from "vitest";
import {
  buildCanonicalUrl,
  buildPageMeta,
  normalizeCanonicalPath,
  resolveArticleCoverImage,
  truncateMetaDescription,
} from "../config/siteMeta.js";

describe("siteMeta", () => {
  it("normalizes canonical paths without query or hash", () => {
    expect(normalizeCanonicalPath("/login?next=%2Fdashboard")).toBe("/login");
    expect(normalizeCanonicalPath("/#faq")).toBe("/");
    expect(normalizeCanonicalPath("/universitet/tdiu/")).toBe("/universitet/tdiu");
  });

  it("truncates long descriptions for SEO snippets", () => {
    const longText = "A".repeat(200);
    expect(truncateMetaDescription(longText).length).toBeLessThanOrEqual(160);
    expect(truncateMetaDescription(longText).endsWith("…")).toBe(true);
  });

  it("builds canonical landing URL", () => {
    expect(buildCanonicalUrl("/")).toMatch(/\/$/);
    expect(buildCanonicalUrl("/login")).toMatch(/\/login$/);
  });

  it("builds page meta with stable image path", () => {
    const meta = buildPageMeta({
      title: "Test | MyUni.uz",
      description: "Test description",
      path: "/universitet/test",
      image: "/images/universities/tdiu.jpg",
      imageAlt: "Test university",
    });
    expect(meta.title).toBe("Test | MyUni.uz");
    expect(meta.absoluteImage).toContain("/images/universities/tdiu.jpg");
    expect(meta.imageAlt).toBe("Test university");
  });

  it("resolveArticleCoverImage normalizes production URLs to local paths", () => {
    expect(resolveArticleCoverImage("https://myuni.uz/images/universities/tdiu.jpg")).toBe(
      "/images/universities/tdiu.jpg"
    );
    expect(resolveArticleCoverImage("")).toContain("/images/hero/");
  });
});
