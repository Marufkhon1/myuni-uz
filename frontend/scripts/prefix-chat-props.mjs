import fs from "fs";

const path = "src/pages/dashboard/DashboardChatSection.jsx";
const names = [
  "chatError", "isPhone", "mobileChatScreen", "chatSectionGridClass", "chatColumnEqualHeightClass",
  "chatListScrollClass", "chatMessagesAreaClass", "chatPanelInnerClass", "chatTabs", "chatListTab",
  "handleChatTabChange", "totalJoinedUnread", "totalPrivateUnread", "universitySearch", "setUniversitySearch",
  "privateThreadList", "renderPrivateThreadRow", "filteredUniversities", "selectedUniversityId",
  "joinedUniversityIds", "selectUniversityChat", "isWideChatLayout", "chatPanel", "selectedThread",
  "backToChatList", "openUserProfile", "formatTime", "privatePinnedMessage", "handleUnpinPrivateMessage",
  "directMessages", "handlePrivateReaction", "handlePinPrivateMessage", "openMessageReport",
  "reactingMessageId", "privateTypingUsers", "privateMessage", "setPrivateMessage", "notifyPrivateTyping",
  "sendPrivateChatMessage", "isPrivateSending", "isGroupChatSearchOpen", "closeGroupChatSearch",
  "openGroupChatSearch", "selectedUniversity", "openGroupInfoModal", "activeChatMembers", "groupPinnedMessage",
  "handleUnpinGroupMessage", "groupMessages", "hasJoinedSelectedChat", "highlightedGroupMessageId",
  "groupMessageRefs", "handleGroupReaction", "handlePinGroupMessage", "user", "openGroupChatAuthorProfile",
  "groupTypingUsers", "groupMessage", "setGroupMessage", "notifyGroupTyping", "sendGroupChatMessage",
  "isGroupSending", "handleLeaveChat", "handleJoin", "isGroupJoining", "groupChatSearchQuery",
  "setGroupChatSearchQuery", "groupChatSearchResults", "jumpToGroupMessage", "showGroupInfoModal",
  "groupInfoUniversity", "isGroupInfoDetailLoading", "setShowGroupInfoModal", "profileUser", "isProfileLoading",
  "hidePrivateMessageButton", "openPrivateChatWithUser", "setProfileUser", "getAuthorColorClass",
];

let source = fs.readFileSync(path, "utf8");
for (const name of names.sort((a, b) => b.length - a.length)) {
  source = source.replace(new RegExp(`\\b${name}\\b`, "g"), `p.${name}`);
}
fs.writeFileSync(path, source);
