import { describe, expect, it } from "vitest";
import { UNIVERSITY_PUBLIC_SECTIONS } from "@/utils/universityPublicSections.js";
import {
  UNIVERSITY_PUBLIC_REVIEWS_HASH,
  buildUniversityPublicSectionUrl,
  resolveUniversityPublicSectionFromHash,
} from "@/utils/universityPublicHash.js";

describe("resolveUniversityPublicSectionFromHash", () => {
  it("maps #reviews to reviews section", () => {
    expect(resolveUniversityPublicSectionFromHash("#reviews")).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);
    expect(resolveUniversityPublicSectionFromHash(" #REVIEWS ")).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);
  });

  it("defaults unknown or empty hash to overview", () => {
    expect(resolveUniversityPublicSectionFromHash("")).toBe(UNIVERSITY_PUBLIC_SECTIONS.overview);
    expect(resolveUniversityPublicSectionFromHash("#overview")).toBe(UNIVERSITY_PUBLIC_SECTIONS.overview);
    expect(resolveUniversityPublicSectionFromHash("#faq")).toBe(UNIVERSITY_PUBLIC_SECTIONS.overview);
  });
});

describe("buildUniversityPublicSectionUrl", () => {
  it("appends reviews hash for reviews section", () => {
    expect(
      buildUniversityPublicSectionUrl("/universitet/tsue", "", UNIVERSITY_PUBLIC_SECTIONS.reviews)
    ).toBe(`/universitet/tsue${UNIVERSITY_PUBLIC_REVIEWS_HASH}`);
  });

  it("keeps query string and omits hash for overview", () => {
    expect(
      buildUniversityPublicSectionUrl(
        "/universitet/tsue",
        "?utm=1",
        UNIVERSITY_PUBLIC_SECTIONS.overview
      )
    ).toBe("/universitet/tsue?utm=1");
  });
});
