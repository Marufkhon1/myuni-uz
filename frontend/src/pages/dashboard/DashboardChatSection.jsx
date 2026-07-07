import { useEffect, useRef } from "react";
import { useDashboard } from "@/hooks/useDashboard.js";
import { useDashboardChatSection } from "@/hooks/useDashboardChatSection.js";
import PrivateThreadRow from "@/components/dashboard/PrivateThreadRow.jsx";
import ChatTagFilterBar from "@/components/chat/ChatTagFilterBar.jsx";
import ChatComposeEditBar from "@/components/chat/ChatComposeEditBar.jsx";
import ChatComposerTextarea from "@/components/chat/ChatComposerTextarea.jsx";
import ChatGroupJoinBar from "@/components/chat/ChatGroupJoinBar.jsx";
import ChatGroupSearchPanel from "@/components/chat/ChatGroupSearchPanel.jsx";
import PinnedMessageBar from "@/components/chat/PinnedMessageBar.jsx";
import TypingUsersLine from "@/components/chat/TypingUsersLine.jsx";
import PrivateChatHeaderStatus from "@/components/chat/PrivateChatHeaderStatus.jsx";
import ChatUniversityRow from "@/components/ChatUniversityRow.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ChatMessageBubble from "@/components/dashboard/ChatMessageBubble.jsx";
import DashboardIcon from "@/components/dashboard/DashboardIcon.jsx";
import GroupInfoModal from "@/components/dashboard/GroupInfoModal.jsx";
import ProfileModal from "@/components/dashboard/ProfileModal.jsx";
import UserAvatarWithPresence from "@/components/dashboard/UserAvatarWithPresence.jsx";
import { chatTabs } from "@/components/dashboard/dashboardConstants.js";
import { ChatMessagesAreaSkeleton } from "@/components/skeletons/DashboardSkeletons.jsx";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { joinedUniversityIdsHas, sameUniversityId } from "@/utils/universityIds.js";

export default function DashboardChatSection() {
  const p = useDashboardChatSection();
  const { openMessageReport } = useDashboard();
  const privateInputRef = useRef(null);
  const groupInputRef = useRef(null);
  const isPrivateThreadMuted =
    Boolean(p.selectedThread?.other_user_id) &&
    Boolean(p.isChatUserMuted?.(p.selectedThread.other_user_id, "private"));

  useEffect(() => {
    if (p.editingChatMessage?.scope === "private") {
      const element = privateInputRef.current;
      element?.focus();
      if (element) {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, [p.editingChatMessage]);

  useEffect(() => {
    if (p.editingChatMessage?.scope === "group") {
      const element = groupInputRef.current;
      element?.focus();
      if (element) {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, [p.editingChatMessage]);

  useEffect(() => {
    if (!p.composerFocusToken) {
      return;
    }
    if (p.chatPanel === "private") {
      privateInputRef.current?.focus();
      return;
    }
    groupInputRef.current?.focus();
  }, [p.composerFocusToken, p.chatPanel]);

  return (
    <section
                className={`grid gap-4 md:items-stretch md:gap-6 ${p.chatSectionGridClass}`}
              >
                <div
                  className={`flex w-full flex-col rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-5 dark:border-white/10 dark:bg-white/[0.06] ${p.chatColumnEqualHeightClass} ${
                    p.isPhone && p.mobileChatScreen !== "list" ? "hidden" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Chatlar</p>
                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">Universitet tanlang</h2>
                  </div>

                  <div className="mt-4 flex gap-1.5 sm:gap-2">
                    {chatTabs.map((tab) => {
                      const hasUnreadBadge =
                        (tab.id === "joined" && p.totalJoinedUnread > 0) ||
                        (tab.id === "private" && p.totalPrivateUnread > 0);
                      const tabLabel = p.isWideChat ? tab.label : (tab.compactLabel ?? tab.label);

                      return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => p.handleChatTabChange(tab.id)}
                        className={`relative min-h-10 flex-1 rounded-2xl px-2 py-2 text-center text-[11px] font-black leading-tight transition hover:-translate-y-0.5 sm:px-3 sm:py-2.5 sm:text-xs xl:px-4 ${
                          p.chatListTab === tab.id
                            ? "bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950"
                            : "bg-slate-100 text-slate-600 hover:border-primary/30 hover:bg-slate-200 hover:text-slate-950 hover:shadow-sm dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-white"
                        } ${hasUnreadBadge ? "pt-3 sm:pt-3.5" : ""}`}
                      >
                        <span>{tabLabel}</span>
                        {tab.id === "joined" && p.totalJoinedUnread > 0 && (
                          <span className="absolute right-1.5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-0.5 text-[9px] font-black leading-none text-white shadow-sm sm:h-5 sm:min-w-5 sm:px-1 sm:text-[10px]">
                            {p.totalJoinedUnread > 99 ? "99+" : p.totalJoinedUnread}
                          </span>
                        )}
                        {tab.id === "private" && p.totalPrivateUnread > 0 && (
                          <span className="absolute right-1.5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-0.5 text-[9px] font-black leading-none text-white shadow-sm sm:h-5 sm:min-w-5 sm:px-1 sm:text-[10px]">
                            {p.totalPrivateUnread > 99 ? "99+" : p.totalPrivateUnread}
                          </span>
                        )}
                      </button>
                      );
                    })}
                  </div>

                  {p.chatListTab === "search" && (
                    <input
                      value={p.universitySearch}
                      onChange={(event) => p.setUniversitySearch(event.target.value)}
                      placeholder="Universitet qidiring..."
                      className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25"
                    />
                  )}

                  <div className={p.chatListScrollClass}>
                    {p.chatListTab === "private" ? (
                      p.privateThreadList.length === 0 ? (
                        <EmptyState
                          compact
                          variant="messages"
                          title="Shaxsiy xabar yo'q"
                          description={'Guruh chatidan profilni ochib "Shaxsiy xabar" tugmasini bosing.'}
                          className="mt-2 border-none bg-transparent dark:bg-transparent"
                        />
                      ) : (
                        p.privateThreadList.map((thread) => (
                          <PrivateThreadRow
                            key={thread.id}
                            thread={thread}
                            isSelected={p.selectedThreadId === thread.id}
                            isTyping={p.isPrivateThreadTyping(thread.id)}
                            onSelect={p.selectPrivateThread}
                          />
                        ))
                      )
                    ) : p.filteredUniversities.length === 0 ? (
                      <EmptyState
                        compact
                        variant={p.chatListTab === "joined" ? "chat" : "search"}
                        title={p.chatListTab === "joined" ? "Qo'shilgan chat yo'q" : "Universitet topilmadi"}
                        description={
                          p.chatListTab === "joined"
                            ? "Qidiruv bo'limidan universitet tanlang va guruh chatiga qo'shiling."
                            : "Boshqa kalit so'z bilan qidirib ko'ring."
                        }
                        action={
                          p.chatListTab === "joined"
                            ? {
                                label: "Universitet qidirish",
                                onClick: () => p.handleChatTabChange("search"),
                              }
                            : undefined
                        }
                        className="mt-2 border-none bg-transparent dark:bg-transparent"
                      />
                    ) : (
                      p.filteredUniversities.map((university) => (
                        <ChatUniversityRow
                          key={university.id}
                          university={university}
                          isSelected={sameUniversityId(p.selectedUniversityId, university.id)}
                          isJoined={joinedUniversityIdsHas(p.joinedUniversityIds, university.id)}
                          onSelect={p.selectUniversityChat}
                          onPrefetch={p.prefetchGroupMessages}
                          typingUsers={p.getUniversityTypingUsers?.(university.id) ?? []}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div
                  className={`flex w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] ${p.chatColumnEqualHeightClass} ${
                    p.isPhone && p.mobileChatScreen !== "chat" ? "hidden" : ""
                  } ${
                    p.isWideChatLayout ? "rounded-2xl md:rounded-[1.25rem]" : "rounded-[2rem]"
                  }`}
                >
                  {p.chatPanel === "private" && p.selectedThread ? (
                    <div
                      className={`${p.chatPanelInnerClass} ${
                        p.isPrivateChatSearchOpen && !p.isPhone ? "md:flex-row" : ""
                      }`}
                    >
                      {!(p.isPhone && p.isPrivateChatSearchOpen) && (
                        <>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <div className="border-b border-slate-200 p-4 sm:px-5 dark:border-white/10">
                        {p.isPhone && (
                          <button
                            type="button"
                            onClick={p.backToChatList}
                            className="mb-3 flex items-center gap-2 text-sm font-black text-primary"
                          >
                            ← Ro&apos;yxat
                          </button>
                        )}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (p.selectedThread.other_user_id) {
                                p.openUserProfile(
                                  p.selectedThread.other_user_id,
                                  {
                                    display_name: p.selectedThread.other_user_name,
                                    avatar_url: p.selectedThread.other_user_avatar_url,
                                  },
                                  {}
                                );
                              }
                            }}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left transition hover:bg-slate-50 dark:hover:bg-white/5 sm:gap-4"
                          >
                            <UserAvatarWithPresence
                              name={p.selectedThread.other_user_name}
                              avatarUrl={p.selectedThread.other_user_avatar_url}
                              size="lg"
                              colorKey={p.selectedThread.other_user_chat_color}
                              userId={p.selectedThread.other_user_id}
                              isOnline={p.selectedThread.other_user_is_online}
                              lastSeenAt={p.selectedThread.other_user_last_seen_at}
                              showPresence
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
                                Shaxsiy chat
                              </p>
                              <h2 className="mt-1 truncate text-xl font-black sm:text-2xl lg:text-3xl hover:text-primary">
                                {p.selectedThread.other_user_name}
                              </h2>
                              <PrivateChatHeaderStatus
                                isTyping={p.privateTypingUsers?.length > 0}
                                isOnline={p.selectedThread.other_user_is_online}
                                lastSeenAt={p.selectedThread.other_user_last_seen_at}
                              />
                            </div>
                          </button>

                          <div className="flex shrink-0 items-center gap-2">
                            {p.selectedThread?.other_user_id ? (
                              <button
                                type="button"
                                onClick={() =>
                                  p.onMuteChatUser?.(
                                    { author_id: p.selectedThread.other_user_id },
                                    "private"
                                  )
                                }
                                className={`grid h-10 w-10 place-items-center rounded-full transition ${
                                  isPrivateThreadMuted
                                    ? "bg-primary/15 text-primary"
                                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                                }`}
                                title={
                                  isPrivateThreadMuted
                                    ? "Bildirishnomalarni yoqish"
                                    : "Bildirishnomalarni o'chirish"
                                }
                                aria-label={
                                  isPrivateThreadMuted
                                    ? "Bildirishnomalarni yoqish"
                                    : "Bildirishnomalarni o'chirish"
                                }
                                aria-pressed={isPrivateThreadMuted}
                              >
                                <DashboardIcon name={isPrivateThreadMuted ? "bell-off" : "bell"} />
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() =>
                                p.isPrivateChatSearchOpen
                                  ? p.closePrivateChatSearch()
                                  : p.openPrivateChatSearch()
                              }
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                                p.isPrivateChatSearchOpen
                                  ? "bg-primary/15 text-primary"
                                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                              }`}
                              title="Xabarlarni qidirish"
                              aria-pressed={p.isPrivateChatSearchOpen}
                            >
                              <DashboardIcon name="search" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <PinnedMessageBar
                        message={p.privatePinnedMessage}
                        formatTime={p.formatTime}
                        onUnpin={p.handleUnpinPrivateMessage}
                      />
                      <div
                        className={`bg-[#e8ecf4] px-4 py-4 sm:px-6 sm:py-5 dark:bg-slate-950/60 ${p.chatMessagesAreaClass}`}
                      >
                        {p.isPrivateMessagesLoading ? (
                          <ChatMessagesAreaSkeleton />
                        ) : p.directMessages.length === 0 ? (
                          <EmptyState
                            compact
                            variant="messages"
                            title={
                              p.selectedThread?.other_user_blocked_by_me
                                ? "Bloklangan foydalanuvchi xabarlari yashirilgan"
                                : "Birinchi shaxsiy xabar"
                            }
                            description={
                              p.selectedThread?.other_user_blocked_by_me
                                ? "Blokdan ochsangiz, yashirilgan xabarlar ham ko'rinadi."
                                : "Suhbatni boshlang — xabaringiz shu yerda ko'rinadi."
                            }
                            className="h-full min-h-[12rem] border-none bg-transparent dark:bg-transparent"
                          />
                        ) : (
                          <div className="w-full space-y-3 pb-3">
                            {p.directMessages.map((item) => (
                              <div
                                key={item.id}
                                ref={(element) => {
                                  if (element) {
                                    p.privateMessageRefs.current[item.id] = element;
                                  } else {
                                    delete p.privateMessageRefs.current[item.id];
                                  }
                                }}
                                className={`rounded-2xl transition ${
                                  p.highlightedPrivateMessageId === item.id
                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-[#e8ecf4] dark:ring-offset-slate-950"
                                    : ""
                                }`}
                              >
                              <ChatMessageBubble
                                message={{
                                  ...item,
                                  is_mine: item.is_mine ?? item.sender_id === p.user?.id,
                                }}
                                formatTime={p.formatTime}
                                onReact={p.handlePrivateReaction}
                                onPin={p.handlePinPrivateMessage}
                                onUnpin={p.handleUnpinPrivateMessage}
                                isPinned={p.privatePinnedMessage?.id === item.id}
                                onReport={(msg) => openMessageReport(msg, "private")}
                                onMute={(msg) => p.onMuteChatUser?.(msg, "private")}
                                isAuthorMuted={p.isChatUserMuted?.(
                                  item.sender_id ?? item.author_id,
                                  "private"
                                )}
                                onEdit={(msg) => p.openEditChatMessage(msg, "private")}
                                onDelete={p.handleDeletePrivateMessage}
                                onAuthorClick={(authorId, prefetch) =>
                                  p.openUserProfile(authorId, prefetch, {})
                                }
                                isReacting={p.reactingMessageId === item.id}
                                containerClassName="max-w-[min(34rem,88%)] sm:max-w-[min(34rem,70%)]"
                              />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {p.selectedThread?.other_user_blocked_by_me ? (
                        <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/90">
                          <button
                            type="button"
                            onClick={p.onUnblockPrivateChatUser}
                            disabled={p.isBlockActionSubmitting}
                            className="min-h-12 w-full rounded-2xl bg-premium-gradient px-6 py-3 text-base font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {p.isBlockActionSubmitting ? "Kutilmoqda..." : "Blokdan ochish"}
                          </button>
                        </div>
                      ) : (
                      <form
                        onSubmit={p.sendPrivateChatMessage}
                        className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/90"
                      >
                        {p.editingChatMessage?.scope === "private" && (
                          <ChatComposeEditBar
                            preview={p.editingChatMessage.message.text}
                            onCancel={p.cancelEditChatMessage}
                          />
                        )}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                          <ChatComposerTextarea
                            inputRef={privateInputRef}
                            value={p.privateMessage}
                            onChange={(event) => {
                              p.setPrivateMessage(event.target.value);
                              if (!p.editingChatMessage) {
                                p.notifyPrivateTyping();
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Escape" && p.editingChatMessage?.scope === "private") {
                                event.preventDefault();
                                p.cancelEditChatMessage();
                                return;
                              }
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                event.currentTarget.form?.requestSubmit();
                              }
                            }}
                            placeholder="Shaxsiy xabar yozing..."
                            className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25"
                          />
                          <button
                            type="submit"
                            disabled={!p.privateMessage.trim() || p.isPrivateSending}
                            className="rounded-2xl bg-premium-gradient px-6 py-3 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {p.editingChatMessage?.scope === "private" ? "Tahrirlash" : "Yuborish"}
                          </button>
                        </div>
                      </form>
                      )}
                    </div>
                        </>
                      )}

                      {p.isPrivateChatSearchOpen && p.selectedThread && (
                        <ChatGroupSearchPanel
                          query={p.privateChatSearchQuery}
                          onQueryChange={p.setPrivateChatSearchQuery}
                          onClose={p.closePrivateChatSearch}
                          thread={p.selectedThread}
                          results={p.privateChatSearchResults}
                          onSelectMessage={p.jumpToPrivateMessage}
                          isPhone={p.isPhone}
                          className={p.isPhone ? "min-h-0 flex-1" : "max-h-full"}
                        />
                      )}
                    </div>
                  ) : p.chatPanel === "private" ? (
                    <div className="grid min-h-[280px] flex-1 place-items-center bg-slate-50 p-8 text-center md:min-h-[420px] dark:bg-slate-950/40">
                      <p className="text-slate-500 dark:text-slate-400">Chap ro'yxatdan suhbat tanlang</p>
                    </div>
                  ) : (
                    <div
                      key={String(p.selectedUniversityId ?? "group")}
                      className={`${p.chatPanelInnerClass} ${
                        p.isGroupChatSearchOpen && !p.isPhone ? "md:flex-row" : ""
                      }`}
                    >
                      {!(p.isPhone && p.isGroupChatSearchOpen) && (
                        <>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <div className="shrink-0 border-b border-slate-200 p-4 sm:px-5 dark:border-white/10">
                        {p.isPhone && p.displayedGroupUniversity && (
                          <button
                            type="button"
                            onClick={p.backToChatList}
                            className="mb-3 flex items-center gap-2 text-sm font-black text-primary"
                          >
                            ← Ro&apos;yxat
                          </button>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={p.openGroupInfoModal}
                            disabled={!p.displayedGroupUniversity}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left transition hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-white/5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                                Guruh chat
                              </p>
                              {p.isGroupChatHeaderLoading ? (
                                <div className="mt-2 space-y-2" aria-busy="true" aria-label="Chat sarlavhasi yuklanmoqda">
                                  <Skeleton className="h-8 w-40 rounded-lg" />
                                  <Skeleton className="h-4 w-56 rounded-md" />
                                </div>
                              ) : (
                                <>
                                  <h2 className="mt-1 text-2xl font-black sm:text-3xl hover:text-primary">
                                    {p.displayedGroupUniversity?.short_name ||
                                      p.displayedGroupUniversity?.name ||
                                      "Universitet"}
                                  </h2>
                                  {p.activeChatMembers.member_count > 0 && (
                                    <p className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                      {p.activeChatMembers.member_count} ta a&apos;zo
                                      {p.displayedGroupUniversity?.location
                                        ? ` · ${p.displayedGroupUniversity.location}`
                                        : ""}
                                    </p>
                                  )}
                                  {p.activeChatMembers.member_count === 0 &&
                                    p.displayedGroupUniversity?.location && (
                                      <p className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                        {p.displayedGroupUniversity.location}
                                      </p>
                                    )}
                                  {p.hasJoinedSelectedChat && p.groupTypingUsers?.length > 0 ? (
                                    <TypingUsersLine
                                      users={p.groupTypingUsers}
                                      mode="group"
                                      className="mt-1 text-sm"
                                    />
                                  ) : null}
                                </>
                              )}
                            </div>
                          </button>

                          {p.displayedGroupUniversity && (
                            <button
                              type="button"
                              onClick={() =>
                                p.isGroupChatSearchOpen ? p.closeGroupChatSearch() : p.openGroupChatSearch()
                              }
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                                p.isGroupChatSearchOpen
                                  ? "bg-primary/15 text-primary"
                                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                              }`}
                              title="Xabarlarni qidirish"
                              aria-pressed={p.isGroupChatSearchOpen}
                            >
                              <DashboardIcon name="search" />
                            </button>
                          )}

                          {p.hasJoinedSelectedChat ? (
                            <button
                              type="button"
                              onClick={p.handleLeaveChat}
                              className="shrink-0 rounded-2xl border border-red-200 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50 dark:border-red-400/30 dark:text-red-400 dark:hover:bg-red-500/10 sm:text-sm"
                            >
                              Chiqish
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {!p.isGroupMessagesLoading && p.groupPinnedMessage ? (
                        <PinnedMessageBar
                          message={p.groupPinnedMessage}
                          formatTime={p.formatTime}
                          onUnpin={p.hasJoinedSelectedChat ? p.handleUnpinGroupMessage : undefined}
                        />
                      ) : null}
                      {p.hasJoinedSelectedChat && !p.isGroupMessagesLoading ? (
                        <ChatTagFilterBar
                          tags={p.groupChatTags ?? []}
                          activeTag={p.activeGroupTag ?? ""}
                          onSelectTag={p.onSelectGroupTag}
                          onClearTag={p.onClearGroupTag}
                        />
                      ) : null}
                      <div
                        className={`bg-[#e8ecf4] px-4 py-4 sm:px-6 sm:py-5 dark:bg-slate-950/60 ${p.chatMessagesAreaClass}`}
                      >
                        {p.isGroupMessagesLoading ? (
                          <ChatMessagesAreaSkeleton />
                        ) : p.groupMessages.length === 0 ? (
                          <EmptyState
                            compact
                            variant="messages"
                            title={
                              p.hasJoinedSelectedChat
                                ? "Birinchi xabaringiz"
                                : "Hozircha xabar yo'q"
                            }
                            description={
                              p.hasJoinedSelectedChat
                                ? "Talabalarga savol bering — suhbat shu yerdan boshlanadi."
                                : "Chatga qo'shilsangiz, xabar yozish va real vaqtda yangilanish ochiladi."
                            }
                            className="h-full min-h-[12rem] border-none bg-transparent dark:bg-transparent"
                          />
                        ) : (
                          <div className="w-full space-y-3 pb-3">
                            {p.groupMessages.map((item) => (
                              <div
                                key={item.id}
                                ref={(element) => {
                                  if (element) {
                                    p.groupMessageRefs.current[item.id] = element;
                                  } else {
                                    delete p.groupMessageRefs.current[item.id];
                                  }
                                }}
                                className={`rounded-2xl transition ${
                                  p.highlightedGroupMessageId === item.id
                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-[#e8ecf4] dark:ring-offset-slate-950"
                                    : ""
                                }`}
                              >
                                <ChatMessageBubble
                                  message={{
                                    ...item,
                                    is_mine: item.is_mine ?? item.author_id === p.user?.id,
                                  }}
                                  formatTime={p.formatTime}
                                  onReact={p.hasJoinedSelectedChat ? p.handleGroupReaction : undefined}
                                  onPin={p.hasJoinedSelectedChat ? p.handlePinGroupMessage : undefined}
                                  onUnpin={p.hasJoinedSelectedChat ? p.handleUnpinGroupMessage : undefined}
                                  isPinned={p.groupPinnedMessage?.id === item.id}
                                  onReport={
                                    p.hasJoinedSelectedChat
                                      ? (msg) => openMessageReport(msg, "group")
                                      : undefined
                                  }
                                  onMute={
                                    p.hasJoinedSelectedChat
                                      ? (msg) => p.onMuteChatUser?.(msg, "group")
                                      : undefined
                                  }
                                  isAuthorMuted={p.isChatUserMuted?.(
                                    item.author_id ?? item.sender_id,
                                    "group"
                                  )}
                                  onTagClick={p.hasJoinedSelectedChat ? p.onSelectGroupTag : undefined}
                                  onEdit={
                                    p.hasJoinedSelectedChat
                                      ? (msg) => p.openEditChatMessage(msg, "group")
                                      : undefined
                                  }
                                  onDelete={
                                    p.hasJoinedSelectedChat ? p.handleDeleteGroupMessage : undefined
                                  }
                                  onAuthorClick={p.openGroupChatAuthorProfile}
                                  showAuthorAvatar
                                  isReacting={p.reactingMessageId === item.id}
                                  containerClassName="max-w-[min(34rem,88%)] sm:max-w-[min(34rem,70%)]"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {p.hasJoinedSelectedChat ? (
                        <form
                          onSubmit={p.sendGroupChatMessage}
                          className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/90"
                        >
                          {p.editingChatMessage?.scope === "group" && (
                            <ChatComposeEditBar
                              preview={p.editingChatMessage.message.text}
                              onCancel={p.cancelEditChatMessage}
                            />
                          )}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <ChatComposerTextarea
                              inputRef={groupInputRef}
                              value={p.groupMessage}
                              onChange={(event) => {
                                p.setGroupMessage(event.target.value);
                                if (!p.editingChatMessage) {
                                  p.notifyGroupTyping();
                                }
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Escape" && p.editingChatMessage?.scope === "group") {
                                  event.preventDefault();
                                  p.cancelEditChatMessage();
                                  return;
                                }
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  event.currentTarget.form?.requestSubmit();
                                }
                              }}
                              placeholder="Xabar yozing..."
                              className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25"
                            />
                            <button
                              type="submit"
                              disabled={!p.groupMessage.trim() || p.isGroupSending}
                              className="rounded-2xl bg-premium-gradient px-6 py-3 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {p.editingChatMessage?.scope === "group" ? "Tahrirlash" : "Yuborish"}
                            </button>
                        </div>
                      </form>
                      ) : (
                        p.selectedUniversity && (
                          <ChatGroupJoinBar
                            onJoin={() => p.handleJoin(p.selectedUniversity.id)}
                            isJoining={p.isGroupJoining}
                          />
                        )
                      )}
                      </div>
                        </>
                      )}

                      {p.isGroupChatSearchOpen && p.selectedUniversity && (
                        <ChatGroupSearchPanel
                          query={p.groupChatSearchQuery}
                          onQueryChange={p.setGroupChatSearchQuery}
                          onClose={p.closeGroupChatSearch}
                          university={p.selectedUniversity}
                          results={p.groupChatSearchResults}
                          onSelectMessage={p.jumpToGroupMessage}
                          isPhone={p.isPhone}
                          className={p.isPhone ? "min-h-0 flex-1" : "max-h-full"}
                        />
                      )}
                    </div>
                  )}
                </div>

                {p.showGroupInfoModal && p.chatPanel === "group" && (
                  <GroupInfoModal
                    university={p.groupInfoUniversity}
                    isDetailLoading={p.isGroupInfoDetailLoading}
                    members={p.activeChatMembers.members}
                    memberCount={p.activeChatMembers.member_count}
                    hasJoined={p.hasJoinedSelectedChat}
                    onJoin={() => p.selectedUniversity && p.handleJoin(p.selectedUniversity.id)}
                    onLeave={p.handleLeaveChat}
                    onMemberClick={(member) =>
                      p.openUserProfile(
                        member.id,
                        {
                          display_name: member.display_name,
                          avatar_url: member.avatar_url,
                          role_label: member.is_me ? "Siz" : member.role_label,
                          university: member.university,
                        },
                        { universityId: p.selectedUniversityId }
                      )
                    }
                    onClose={() => p.setShowGroupInfoModal(false)}
                  />
                )}

                <ProfileModal
                  profileUser={p.profileUser}
                  isProfileLoading={p.isProfileLoading}
                  currentUserId={p.user?.id}
                  hidePrivateMessage={p.hidePrivateMessageButton}
                  isBlockedByMe={p.isProfileUserBlockedByMe}
                  hasBlockRelationship={p.hasProfileBlockRelationship}
                  isBlockSubmitting={p.isBlockActionSubmitting}
                  onPrivateMessage={() => p.openPrivateChatWithUser(p.profileUser.id)}
                  onBlock={p.onBlockProfileUser}
                  onUnblock={p.onUnblockProfileUser}
                  onClose={() => p.setProfileUser(null)}
                />
    </section>
  );
}

