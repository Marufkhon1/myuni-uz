import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContactPage from "./ContactPage.jsx";

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
  default: () => <div data-testid="office-map" />,
}));

describe("ContactPage", () => {
  it("renders email, office map, and does not show placeholder phone by default", () => {
    render(
      <MemoryRouter initialEntries={["/aloqa"]}>
        <ContactPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: /^aloqa$/i })).toBeInTheDocument();
    const emailLink = screen.getAllByRole("link").find((node) =>
      (node.getAttribute("href") || "").startsWith("mailto:")
    );
    expect(emailLink).toBeTruthy();
    // Page + footer both embed the office map
    expect(screen.getAllByTestId("office-map").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("heading", { name: /^telefon$/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/\+998 90 123/)).not.toBeInTheDocument();
  });
});
