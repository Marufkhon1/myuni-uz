import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ReportErrorPage from "./ReportErrorPage.jsx";

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

const apiPost = vi.fn();
vi.mock("@/services/api.js", () => ({
  api: {
    post: (...args) => apiPost(...args),
  },
}));

describe("ReportErrorPage", () => {
  it("submits structured support message", async () => {
    const user = userEvent.setup();
    apiPost.mockResolvedValue({ data: { accepted: true } });

    render(
      <MemoryRouter initialEntries={["/xato-xabar?url=%2Freyting%2F2026"]}>
        <ReportErrorPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: /xato haqida xabar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/sahifa manzili/i)).toHaveValue("/reyting/2026");

    await user.type(screen.getByLabelText(/xato tavsifi/i), "Reyting jadvalida ball noto'g'ri.");
    await user.click(screen.getByRole("button", { name: /yuborish/i }));

    await screen.findByRole("heading", { name: /qabul qilindi/i });
    expect(apiPost).toHaveBeenCalledWith(
      "/auth/support/message/",
      expect.objectContaining({
        message: expect.stringContaining("[Xato haqida xabar]"),
        company: "",
      })
    );
  });

  it("rejects too-short descriptions before API call", async () => {
    const user = userEvent.setup();
    apiPost.mockClear();

    render(
      <MemoryRouter initialEntries={["/xato-xabar"]}>
        <ReportErrorPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/xato tavsifi/i), "qisqa");
    await user.click(screen.getByRole("button", { name: /yuborish/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/12 belgi/i);
    expect(apiPost).not.toHaveBeenCalled();
  });

  it("short-circuits honeypot fills without calling API", async () => {
    const user = userEvent.setup();
    apiPost.mockClear();

    render(
      <MemoryRouter initialEntries={["/xato-xabar"]}>
        <ReportErrorPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/company/i, { hidden: true }), "spam-bot");
    await user.type(screen.getByLabelText(/xato tavsifi/i), "Reyting jadvalida ball noto'g'ri.");
    await user.click(screen.getByRole("button", { name: /yuborish/i }));

    await screen.findByRole("heading", { name: /qabul qilindi/i });
    expect(apiPost).not.toHaveBeenCalled();
  });
});
