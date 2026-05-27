import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary.jsx";

function BrokenChild() {
  throw new Error("test crash");
}

describe("ErrorBoundary", () => {
  it("shows fallback UI when a child throws", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <BrokenChild />
        </ErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /kutilmagan xatolik/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yangilash/i })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
