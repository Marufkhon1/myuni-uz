/**
 * Mobile dashboard chrome (bottom nav + Support FAB) must not compete with
 * the chat composer. Suppress while a compact chat thread is open.
 */
export function isDashboardChatThreadScreen(mobileChatScreen) {
  return mobileChatScreen === "chat";
}

export function shouldSuppressDashboardMobileChrome({
  isCompactLayout = false,
  activeSection = "",
  mobileChatScreen = "list",
} = {}) {
  return Boolean(
    isCompactLayout &&
      activeSection === "chats" &&
      isDashboardChatThreadScreen(mobileChatScreen)
  );
}
