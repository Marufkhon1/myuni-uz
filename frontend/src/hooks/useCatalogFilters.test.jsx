import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useCatalogFilters } from "./useCatalogFilters.js";

function renderCatalogFilters(initialEntries = ["/universitetlar"]) {
  return renderHook(() => useCatalogFilters(20), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    ),
  });
}

describe("useCatalogFilters", () => {
  it("keeps local filter changes until debounced URL sync completes", () => {
    vi.useFakeTimers();
    const { result } = renderCatalogFilters(["/universitetlar"]);

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        city: "Toshkent",
      });
    });

    expect(result.current.filters.city).toBe("Toshkent");

    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(result.current.debouncedFilters.city).toBe("Toshkent");
    expect(result.current.filters.city).toBe("Toshkent");

    vi.useRealTimers();
  });

  it("syncs filters from URL search params", () => {
    const { result } = renderCatalogFilters(["/universitetlar?city=Andijon&q=adu"]);

    expect(result.current.filters.city).toBe("Andijon");
    expect(result.current.filters.q).toBe("adu");
  });
});
