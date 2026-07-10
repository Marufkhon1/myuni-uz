import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardMobileSupport from "./DashboardMobileSupport.jsx";

vi.mock("@/hooks/useSupportChat.js", () => ({
  useSupportChat: () => ({
    isChatModalOpen: false,
    openChatModal: vi.fn(),
    closeChatModal: vi.fn(),
    draft: "",
    setDraft: vi.fn(),
    messages: [],
    setMessages: vi.fn(),
  }),
}));

vi.mock("./SupportChatModal.jsx", () => ({
  default: () => null,
}));

afterEach(() => {
  cleanup();
});

describe("DashboardMobileSupport", () => {
  it("shows the Support FAB by default on mobile chrome", () => {
    render(<DashboardMobileSupport />);
    expect(screen.getByTestId("dashboard-support-fab")).toBeInTheDocument();
  });

  it("hides the Support FAB while a chat thread owns the bottom zone", () => {
    render(<DashboardMobileSupport hidden />);
    expect(screen.queryByTestId("dashboard-support-fab")).not.toBeInTheDocument();
  });
});
