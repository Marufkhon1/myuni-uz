import fs from "fs";

const path = "src/pages/DashboardPage.jsx";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

const start = lines.findIndex((line) => line.trim() === '{activeSection === "chats" && (');
if (start < 0) {
  throw new Error("chat section start not found");
}
let end = start;
let depth = 0;
for (let i = start; i < lines.length; i += 1) {
  const line = lines[i];
  if (line.includes("<section")) depth += 1;
  if (line.trim() === "</section>") {
    depth -= 1;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
// include closing )}
if (lines[end + 1]?.trim() === ")}") {
  end += 1;
}

const chatReplacement = [
  '            {activeSection === "chats" && (',
  "              <DashboardChatSection",
  "                chatError={chatError}",
  "                isPhone={isPhone}",
  "                mobileChatScreen={mobileChatScreen}",
  "                chatSectionGridClass={chatSectionGridClass}",
  "                chatColumnEqualHeightClass={chatColumnEqualHeightClass}",
  "                chatListScrollClass={chatListScrollClass}",
  "                chatMessagesAreaClass={chatMessagesAreaClass}",
  "                chatPanelInnerClass={chatPanelInnerClass}",
  "                chatListTab={chatListTab}",
  "                handleChatTabChange={handleChatTabChange}",
  "                totalJoinedUnread={totalJoinedUnread}",
  "                totalPrivateUnread={totalPrivateUnread}",
  "                universitySearch={universitySearch}",
  "                setUniversitySearch={setUniversitySearch}",
  "                privateThreadList={privateThreadList}",
  "                renderPrivateThreadRow={renderPrivateThreadRow}",
  "                filteredUniversities={filteredUniversities}",
  "                selectedUniversityId={selectedUniversityId}",
  "                joinedUniversityIds={joinedUniversityIds}",
  "                selectUniversityChat={selectUniversityChat}",
  "                isWideChatLayout={isWideChatLayout}",
  "                chatPanel={chatPanel}",
  "                selectedThread={selectedThread}",
  "                backToChatList={backToChatList}",
  "                openUserProfile={openUserProfile}",
  "                formatTime={formatTime}",
  "                privatePinnedMessage={privatePinnedMessage}",
  "                handleUnpinPrivateMessage={handleUnpinPrivateMessage}",
  "                directMessages={directMessages}",
  "                handlePrivateReaction={handlePrivateReaction}",
  "                handlePinPrivateMessage={handlePinPrivateMessage}",
  "                handleUnpinGroupMessage={handleUnpinGroupMessage}",
  "                openMessageReport={openMessageReport}",
  "                reactingMessageId={reactingMessageId}",
  "                privateTypingUsers={privateTypingUsers}",
  "                privateMessage={privateMessage}",
  "                setPrivateMessage={setPrivateMessage}",
  "                notifyPrivateTyping={notifyPrivateTyping}",
  "                sendPrivateChatMessage={sendPrivateChatMessage}",
  "                isPrivateSending={isPrivateSending}",
  "                isGroupChatSearchOpen={isGroupChatSearchOpen}",
  "                closeGroupChatSearch={closeGroupChatSearch}",
  "                openGroupChatSearch={openGroupChatSearch}",
  "                selectedUniversity={selectedUniversity}",
  "                openGroupInfoModal={openGroupInfoModal}",
  "                activeChatMembers={activeChatMembers}",
  "                groupPinnedMessage={groupPinnedMessage}",
  "                groupMessages={groupMessages}",
  "                hasJoinedSelectedChat={hasJoinedSelectedChat}",
  "                highlightedGroupMessageId={highlightedGroupMessageId}",
  "                groupMessageRefs={groupMessageRefs}",
  "                handleGroupReaction={handleGroupReaction}",
  "                handlePinGroupMessage={handlePinGroupMessage}",
  "                user={user}",
  "                openGroupChatAuthorProfile={openGroupChatAuthorProfile}",
  "                groupTypingUsers={groupTypingUsers}",
  "                groupMessage={groupMessage}",
  "                setGroupMessage={setGroupMessage}",
  "                notifyGroupTyping={notifyGroupTyping}",
  "                sendGroupChatMessage={sendGroupChatMessage}",
  "                isGroupSending={isGroupSending}",
  "                handleLeaveChat={handleLeaveChat}",
  "                handleJoin={handleJoin}",
  "                isGroupJoining={isGroupJoining}",
  "                groupChatSearchQuery={groupChatSearchQuery}",
  "                setGroupChatSearchQuery={setGroupChatSearchQuery}",
  "                groupChatSearchResults={groupChatSearchResults}",
  "                jumpToGroupMessage={jumpToGroupMessage}",
  "                showGroupInfoModal={showGroupInfoModal}",
  "                groupInfoUniversity={groupInfoUniversity}",
  "                isGroupInfoDetailLoading={isGroupInfoDetailLoading}",
  "                setShowGroupInfoModal={setShowGroupInfoModal}",
  "                profileUser={profileUser}",
  "                isProfileLoading={isProfileLoading}",
  "                hidePrivateMessageButton={hidePrivateMessageButton}",
  "                openPrivateChatWithUser={openPrivateChatWithUser}",
  "                setProfileUser={setProfileUser}",
  "              />",
  "            )}",
];

const newLines = [...lines.slice(0, start), ...chatReplacement, ...lines.slice(end + 1)];
fs.writeFileSync(path, newLines.join("\n"));
