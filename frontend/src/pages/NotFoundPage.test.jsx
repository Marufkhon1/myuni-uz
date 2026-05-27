import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage.jsx";

describe("NotFoundPage", () => {
  it("renders 404 copy and home link", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /topilmadi/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bosh sahifaga qaytish/i })).toHaveAttribute("href", "/");
  });
});
