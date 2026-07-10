import { describe, expect, it } from "vitest";
import { buildDashboardChatLayoutClasses } from "./buildDashboardChatLayoutClasses.js";

const compactBase = {
  isDesktop: false,
  activeSection: "chats",
  chatListTab: "joined",
  chatPanel: "group",
  isCompactLayout: true,
};

describe("buildDashboardChatLayoutClasses (P0 mobile shell)", () => {
  it("drops magic dvh message heights on compact layouts", () => {
    const layout = buildDashboardChatLayoutClasses({
      ...compactBase,
      mobileChatScreen: "chat",
    });

    expect(layout.chatMessagesAreaClass).toContain("flex-1");
    expect(layout.chatMessagesAreaClass).toContain("min-h-0");
    expect(layout.chatMessagesAreaClass).not.toMatch(/100dvh/);
    expect(layout.chatPanelInnerClass).toContain("flex-1");
    expect(layout.chatColumnEqualHeightClass).not.toMatch(/max-h-\[calc\(100dvh/);
  });

  it("marks compact thread as immersive with docked composer safe-area", () => {
    const layout = buildDashboardChatLayoutClasses({
      ...compactBase,
      mobileChatScreen: "chat",
    });

    expect(layout.isImmersiveThread).toBe(true);
    expect(layout.chatThreadSurfaceClass).toContain("rounded-none");
    expect(layout.chatComposerBarClass).toContain("pb-safe");
    expect(layout.chatComposerBarClass).toContain("chat-composer-dock");
    expect(layout.chatComposerBarClass).toContain("shrink-0");
    expect(layout.chatThreadHeaderClass).toContain("page-top-safe");
  });

  it("keeps list mode non-immersive", () => {
    const layout = buildDashboardChatLayoutClasses({
      ...compactBase,
      mobileChatScreen: "list",
    });

    expect(layout.isImmersiveThread).toBe(false);
    expect(layout.chatComposerBarClass).not.toContain("pb-safe");
  });

  it("keeps desktop bounded column height for two-pane layout", () => {
    const layout = buildDashboardChatLayoutClasses({
      isDesktop: true,
      activeSection: "chats",
      chatListTab: "joined",
      chatPanel: "group",
      isCompactLayout: false,
      mobileChatScreen: "list",
    });

    expect(layout.isImmersiveThread).toBe(false);
    expect(layout.isWideChatLayout).toBe(true);
    expect(layout.chatColumnEqualHeightClass).toMatch(/100dvh-11\.5rem/);
    expect(layout.chatMessagesAreaClass).toContain("flex-1");
  });
});
