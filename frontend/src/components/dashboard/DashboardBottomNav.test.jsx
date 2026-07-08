import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardBottomNav from "./DashboardBottomNav.jsx";
import { getDashboardMenuItems } from "@/utils/dashboardRoleContent.js";

afterEach(() => {
  cleanup();
});

function renderNav(props = {}) {
  const items = getDashboardMenuItems(true);
  const view = render(
    <DashboardBottomNav items={items} activeSection="home" onSelect={() => {}} {...props} />
  );
  const nav = screen.getByTestId("dashboard-bottom-nav");
  return { ...view, nav, items };
}

describe("DashboardBottomNav", () => {
  it("renders exactly 5 destinations with accessible names", () => {
    const { nav } = renderNav({ activeSection: "home" });

    expect(nav).toHaveAttribute("data-nav-count", "5");
    expect(nav).toHaveAttribute("aria-label", "Asosiy menyu");

    const tabs = within(nav).getAllByRole("button");
    expect(tabs).toHaveLength(5);
    expect(tabs.map((tab) => tab.getAttribute("data-nav-id"))).toEqual([
      "home",
      "chats",
      "reviews",
      "compare",
      "more",
    ]);
    expect(within(nav).getByRole("button", { name: "Bosh sahifa" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(nav).getByRole("button", { name: "Yana" })).toHaveAttribute(
      "aria-haspopup",
      "dialog"
    );
  });

  it("opens more sheet and navigates to overflow section", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { nav } = renderNav({ activeSection: "chats", onSelect });

    await user.click(within(nav).getByRole("button", { name: "Yana" }));
    const sheet = screen.getByTestId("dashboard-bottom-nav-more");
    expect(within(sheet).getByRole("dialog", { name: "Yana" })).toBeInTheDocument();

    await user.click(within(sheet).getByRole("button", { name: /Profil/i }));
    expect(onSelect).toHaveBeenCalledWith("profile");
    expect(screen.queryByTestId("dashboard-bottom-nav-more")).not.toBeInTheDocument();
  });

  it("highlights more tab when an overflow section is active", () => {
    const { nav } = renderNav({ activeSection: "favorites" });
    const moreTab = within(nav).getByRole("button", { name: "Yana" });
    expect(moreTab.className).toMatch(/bg-slate-950|dark:bg-white/);
    expect(within(nav).getByRole("button", { name: "Bosh sahifa" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("closes more sheet with Escape", async () => {
    const user = userEvent.setup();
    const { nav } = renderNav({ activeSection: "home" });

    await user.click(within(nav).getByRole("button", { name: "Yana" }));
    expect(screen.getByTestId("dashboard-bottom-nav-more")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("dashboard-bottom-nav-more")).not.toBeInTheDocument();
  });
});
