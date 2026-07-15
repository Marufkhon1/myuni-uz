import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResourcesMenu from "./ResourcesMenu.jsx";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const trackHubCta = vi.fn();
vi.mock("@/lib/analytics.js", () => ({
  trackHubCta: (...args) => trackHubCta(...args),
}));

describe("ResourcesMenu", () => {
  beforeEach(() => {
    trackHubCta.mockClear();
  });

  it("opens with ArrowDown and moves focus with ArrowDown inside menu", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResourcesMenu isDark={false} pathname="/" />
      </MemoryRouter>
    );

    const trigger = screen.getByRole("button", { name: /resurslar/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: /resurslar/i })).toBeInTheDocument();

    const items = screen.getAllByRole("menuitem");
    await waitFor(() => {
      expect(items[0]).toHaveFocus();
    });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(items[1]).toHaveFocus();
    });

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("tracks hub CTA when a resource link is chosen", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResourcesMenu isDark pathname="/" />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /resurslar/i }));
    await user.click(screen.getByRole("menuitem", { name: /aloqa/i }));
    expect(trackHubCta).toHaveBeenCalledWith("/aloqa", "nav_resources");
  });
});
