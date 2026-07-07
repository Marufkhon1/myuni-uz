import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UNIVERSITY_PUBLIC_SECTIONS } from "@/utils/universityPublicSections.js";
import { useUniversityPublicSection } from "./useUniversityPublicSection.js";

function renderUniversityPublicSection(slug = "tsue", url = "/universitet/tsue") {
  window.history.replaceState(null, "", url);
  return renderHook(({ currentSlug }) => useUniversityPublicSection(currentSlug), {
    initialProps: { currentSlug: slug },
  });
}

describe("useUniversityPublicSection", () => {
  it("initializes from #reviews hash", () => {
    const { result } = renderUniversityPublicSection("tsue", "/universitet/tsue#reviews");
    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);
  });

  it("defaults to overview without hash", () => {
    const { result } = renderUniversityPublicSection("tsue", "/universitet/tsue");
    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.overview);
  });

  it("pushes history when switching sections", () => {
    const pushState = vi.spyOn(window.history, "pushState");
    const { result } = renderUniversityPublicSection("tsue", "/universitet/tsue");

    act(() => {
      result.current.handleSectionChange(UNIVERSITY_PUBLIC_SECTIONS.reviews);
    });

    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);
    expect(pushState).toHaveBeenCalledWith(null, "", "/universitet/tsue#reviews");
    pushState.mockRestore();
  });

  it("syncs section on browser back/forward (popstate)", () => {
    const { result } = renderUniversityPublicSection("tsue", "/universitet/tsue");

    act(() => {
      window.history.replaceState(null, "", "/universitet/tsue#reviews");
      window.dispatchEvent(new window.PopStateEvent("popstate"));
    });

    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);
  });

  it("syncs section on hashchange", () => {
    const { result } = renderUniversityPublicSection("tsue", "/universitet/tsue");

    act(() => {
      window.history.replaceState(null, "", "/universitet/tsue#reviews");
      window.dispatchEvent(new window.HashChangeEvent("hashchange"));
    });

    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);
  });

  it("resets to overview when slug changes without hash", () => {
    const { result, rerender } = renderUniversityPublicSection("tsue", "/universitet/tsue#reviews");
    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.reviews);

    act(() => {
      window.history.replaceState(null, "", "/universitet/adu");
      rerender({ currentSlug: "adu" });
    });

    expect(result.current.activeSection).toBe(UNIVERSITY_PUBLIC_SECTIONS.overview);
  });
});
