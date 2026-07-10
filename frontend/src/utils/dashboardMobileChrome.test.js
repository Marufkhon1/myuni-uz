import { describe, expect, it } from "vitest";
import {
  isDashboardChatThreadScreen,
  shouldSuppressDashboardMobileChrome,
} from "./dashboardMobileChrome.js";

describe("shouldSuppressDashboardMobileChrome", () => {
  it("suppresses bottom nav + Support FAB on compact chat thread", () => {
    expect(
      shouldSuppressDashboardMobileChrome({
        isCompactLayout: true,
        activeSection: "chats",
        mobileChatScreen: "chat",
      })
    ).toBe(true);
  });

  it("keeps chrome on chat list", () => {
    expect(
      shouldSuppressDashboardMobileChrome({
        isCompactLayout: true,
        activeSection: "chats",
        mobileChatScreen: "list",
      })
    ).toBe(false);
  });

  it("keeps chrome on other sections even if screen flag is chat", () => {
    expect(
      shouldSuppressDashboardMobileChrome({
        isCompactLayout: true,
        activeSection: "home",
        mobileChatScreen: "chat",
      })
    ).toBe(false);
  });

  it("never suppresses on desktop layout", () => {
    expect(
      shouldSuppressDashboardMobileChrome({
        isCompactLayout: false,
        activeSection: "chats",
        mobileChatScreen: "chat",
      })
    ).toBe(false);
  });

  it("exposes thread screen helper", () => {
    expect(isDashboardChatThreadScreen("chat")).toBe(true);
    expect(isDashboardChatThreadScreen("list")).toBe(false);
  });
});
