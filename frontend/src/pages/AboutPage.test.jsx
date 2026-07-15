import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "./AboutPage.jsx";

vi.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    role: null,
  }),
}));

vi.mock("@/hooks/useDarkMode.js", () => ({
  useDarkMode: () => ({ isDark: false, setIsDark: vi.fn() }),
}));

vi.mock("@/hooks/usePageMeta.js", () => ({
  usePageMeta: vi.fn(),
}));

vi.mock("@/hooks/useFocusTrap.js", () => ({
  default: () => {},
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/OfficeMapEmbed.jsx", () => ({
  default: () => <div data-testid="map" />,
}));

describe("AboutPage", () => {
  it("renders dedicated About route content and breadcrumb", () => {
    render(
      <MemoryRouter initialEntries={["/haqida"]}>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: /biz haqimizda/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    const related = screen.getByRole("navigation", { name: /tegishli sahifalar/i });
    expect(related.querySelector('a[href="/metodologiya"]')).not.toBeNull();
    expect(screen.getByRole("heading", { name: /missiya/i })).toBeInTheDocument();
  });
});
