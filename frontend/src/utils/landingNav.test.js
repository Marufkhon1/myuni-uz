import { describe, expect, it } from "vitest";
import { normalizeNavHash, pickActiveSectionByAnchor } from "./landingNav.js";

describe("normalizeNavHash", () => {
  it("defaults empty to home", () => {
    expect(normalizeNavHash("")).toBe("#home");
    expect(normalizeNavHash()).toBe("#home");
  });

  it("keeps or adds hash prefix", () => {
    expect(normalizeNavHash("#how-it-works")).toBe("#how-it-works");
    expect(normalizeNavHash("faq")).toBe("#faq");
  });
});

describe("pickActiveSectionByAnchor", () => {
  const sections = [
    { hash: "#home", top: 0 },
    { hash: "#how-it-works", top: 900 },
    { hash: "#universities", top: 1800 },
    { hash: "#reviews", top: 2700 },
    { hash: "#faq", top: 3600 },
    { hash: "#about", top: 4500 },
  ];

  it("picks home at top", () => {
    expect(pickActiveSectionByAnchor(sections, 0, 80)).toBe("#home");
  });

  it("picks universities when scrolling down through that section", () => {
    expect(pickActiveSectionByAnchor(sections, 1850, 80)).toBe("#universities");
  });

  it("picks universities when scrolling up from below", () => {
    expect(pickActiveSectionByAnchor(sections, 1900, 80)).toBe("#universities");
    expect(pickActiveSectionByAnchor(sections, 1810, 80)).toBe("#universities");
  });

  it("picks how-it-works when between home and universities scrolling up", () => {
    expect(pickActiveSectionByAnchor(sections, 950, 80)).toBe("#how-it-works");
  });
});
