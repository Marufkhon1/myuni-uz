import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import NavbarSearch from "./NavbarSearch.jsx";

vi.mock("@/lib/analytics.js", () => ({
  trackHubCta: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="loc">{`${location.pathname}${location.search}`}</div>;
}

describe("NavbarSearch", () => {
  it("navigates to catalog with q param", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavbarSearch isDark={false} />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByRole("searchbox");
    await user.type(input, "TDIU");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("loc").textContent).toBe("/universitetlar?q=TDIU");
  });

  it("navigates to bare catalog when query empty", async () => {
    const user = userEvent.setup();
    const onSubmitSuccess = vi.fn();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavbarSearch isDark onSubmitSuccess={onSubmitSuccess} />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole("searchbox"));
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("loc").textContent).toBe("/universitetlar");
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
  });
});
