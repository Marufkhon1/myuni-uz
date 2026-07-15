import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CURRENT_RANKING_YEAR, rankingsYearPath } from "@/config/rankings.js";
import RankingsPage from "./RankingsPage.jsx";

vi.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, role: null }),
}));

vi.mock("@/hooks/useDarkMode.js", () => ({
  useDarkMode: () => ({ isDark: false, setIsDark: vi.fn() }),
}));

vi.mock("@/hooks/usePageMeta.js", () => ({ usePageMeta: vi.fn() }));
vi.mock("@/hooks/useFocusTrap.js", () => ({ default: () => {} }));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
}));

vi.mock("@/components/OfficeMapEmbed.jsx", () => ({
  default: () => <div data-testid="map" />,
}));

describe("RankingsPage", () => {
  it("renders hub honesty and live year link", () => {
    render(
      <MemoryRouter>
        <RankingsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: /soft reyting/i })).toBeInTheDocument();
    expect(screen.getByText(/yillar bo'yicha/i)).toBeInTheDocument();
    expect(screen.getByText(/rasmiy davlat yoki xalqaro/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(String(CURRENT_RANKING_YEAR), "i") })).toHaveAttribute(
      "href",
      rankingsYearPath()
    );
    expect(screen.getAllByRole("link", { name: /xato haqida xabar/i }).length).toBeGreaterThan(0);
  });
});
