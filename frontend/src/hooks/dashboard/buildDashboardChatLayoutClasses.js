import { isDashboardChatThreadScreen } from "@/utils/dashboardMobileChrome.js";

/**
 * Telegram/WhatsApp-style chat shell classes.
 * Compact thread uses flex column (header / messages / composer) — no magic
 * 100dvh message heights that clip the composer on phones.
 */
export function buildDashboardChatLayoutClasses({
  isDesktop,
  activeSection,
  chatListTab,
  chatPanel,
  isCompactLayout,
  mobileChatScreen,
}) {
  const isPrivateChatLayout =
    isDesktop && activeSection === "chats" && chatListTab === "private";

  const isGroupChatLayout =
    isDesktop && activeSection === "chats" && chatPanel === "group";

  const isWideChatLayout = isPrivateChatLayout || isGroupChatLayout;
  const isImmersiveThread =
    isCompactLayout && isDashboardChatThreadScreen(mobileChatScreen);

  const chatColumnEqualHeightClass = isCompactLayout
    ? "flex min-h-0 flex-1 flex-col overflow-hidden self-stretch"
    : "md:flex md:h-[calc(100dvh-11.5rem)] md:max-h-[calc(100dvh-11.5rem)] md:flex-col md:overflow-hidden";

  const chatListScrollClass =
    "chat-messages-scroll mt-3 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5";

  const chatMessagesAreaClass =
    "chat-messages-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain";

  const chatPanelInnerClass = "flex min-h-0 flex-1 flex-col overflow-hidden";

  const chatSectionGridClass = isCompactLayout
    ? "grid-cols-1"
    : isWideChatLayout
      ? "lg:grid-cols-[minmax(280px,30%)_minmax(0,1fr)] lg:gap-4 xl:gap-5"
      : "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[420px_1fr]";

  const chatThreadSurfaceClass = isImmersiveThread
    ? "rounded-none border-0 shadow-none"
    : isWideChatLayout
      ? "rounded-2xl border border-slate-200 shadow-soft md:rounded-[1.25rem] dark:border-white/10"
      : "rounded-[2rem] border border-slate-200 shadow-soft dark:border-white/10";

  const chatComposerBarClass = isImmersiveThread
    ? "chat-composer-dock shrink-0 border-t border-slate-200 bg-white p-4 pb-safe dark:border-white/10 dark:bg-slate-900/90"
    : "shrink-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/90";

  const chatThreadHeaderClass = isImmersiveThread
    ? "shrink-0 border-b border-slate-200 p-4 page-top-safe sm:px-5 dark:border-white/10"
    : "shrink-0 border-b border-slate-200 p-4 sm:px-5 dark:border-white/10";

  return {
    isWideChatLayout,
    isImmersiveThread,
    chatSectionGridClass,
    chatColumnEqualHeightClass,
    chatListScrollClass,
    chatMessagesAreaClass,
    chatPanelInnerClass,
    chatThreadSurfaceClass,
    chatComposerBarClass,
    chatThreadHeaderClass,
  };
}
