import { describe, expect, it } from "vitest";
import {
  getUniversityBrandGradient,
  getUniversityBrandHue,
  getUniversityImageUrl,
  getUniversityOgImagePath,
  universityImagePath,
} from "@/utils/universityImage.js";

describe("universityImagePath", () => {
  it("builds slug-based campus path", () => {
    expect(universityImagePath("tsue")).toBe("/images/universities/tsue.jpg");
    expect(universityImagePath("")).toBe("");
  });
});

describe("getUniversityImageUrl", () => {
  it("prefers valid custom image_url", () => {
    expect(
      getUniversityImageUrl({
        slug: "tsue",
        image_url: "/media/universities/tsue.jpg",
      })
    ).toBe("/media/universities/tsue.jpg");
  });

  it("filters legacy placeholder hosts and _default.jpg", () => {
    expect(
      getUniversityImageUrl({
        slug: "alfraganus",
        image_url: "https://images.unsplash.com/photo-123",
      })
    ).toBe("/images/universities/alfraganus.jpg");

    expect(
      getUniversityImageUrl({
        slug: "wiut",
        image_url: "/images/universities/_default.jpg",
      })
    ).toBe("/images/universities/wiut.jpg");

    expect(
      getUniversityImageUrl({
        slug: "adu",
        image_url: "/images/campuses/old-campus.jpg",
      })
    ).toBe("/images/universities/adu.jpg");

    expect(
      getUniversityImageUrl({
        slug: "npu",
        image_url: "https://picsum.photos/seed/uni/800/400",
      })
    ).toBe("/images/universities/npu.jpg");
  });

  it("falls back to slug path when image_url is empty", () => {
    expect(getUniversityImageUrl({ slug: "tsue", image_url: "" })).toBe(
      "/images/universities/tsue.jpg"
    );
    expect(getUniversityImageUrl(null)).toBe("");
  });
});

describe("getUniversityBrandGradient", () => {
  it("returns stable gradient for the same university key", () => {
    const university = { slug: "alfraganus", name: "Alfraganus" };
    expect(getUniversityBrandHue(university)).toBe(getUniversityBrandHue(university));
    expect(getUniversityBrandGradient(university)).toBe(getUniversityBrandGradient(university));
    expect(getUniversityBrandGradient(university)).toMatch(/^linear-gradient\(135deg, hsl\(/);
  });

  it("uses slug before name for hue selection", () => {
    const bySlug = getUniversityBrandHue({ slug: "tsue", name: "Other" });
    const byName = getUniversityBrandHue({ name: "Other" });
    expect(bySlug).not.toBe(byName);
  });
});

describe("getUniversityOgImagePath", () => {
  it("falls back to site OG image when university image is unavailable", () => {
    expect(getUniversityOgImagePath({ slug: "", image_url: "" })).toBe("/og-image.png");
  });

  it("uses resolved university image when available", () => {
    expect(
      getUniversityOgImagePath({
        slug: "tsue",
        image_url: "/media/universities/tsue.jpg",
      })
    ).toBe("/media/universities/tsue.jpg");
  });
});
