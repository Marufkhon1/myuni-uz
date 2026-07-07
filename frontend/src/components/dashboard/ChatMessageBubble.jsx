import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChatAuthorName from "../chat/ChatAuthorName.jsx";
import ChatMessageContextMenu from "../chat/ChatMessageContextMenu.jsx";
import ChatMessageText from "../chat/ChatMessageText.jsx";
import ChatReactionPicker from "../chat/ChatReactionPicker.jsx";
import UserAvatarWithPresence from "./UserAvatarWithPresence.jsx";
import { clampContextMenuPosition, getReactionPickerPosition } from "@/utils/chatMenuPosition.js";

const MENU_ESTIMATE = { width: 210, height: 168 };
const HOVER_HEART_DELAY_MS = 1500;
const HOVER_LEAVE_DELAY_MS = 200;
const HOVER_LEAVE_WITH_PICKER_MS = 400;

export default function ChatMessageBubble({
  message,
  formatTime,
  onReact,
  onEdit,
  onDelete,
  onReport,
  onMute,
  isAuthorMuted = false,
  onTagClick,
  onPin,
  onUnpin,
  isPinned = false,
  onAuthorClick,
  showAuthorAvatar = false,
  isReacting = false,
  mineClassName = "bg-primary text-white",
  otherClassName = "bg-white text-slate-900 dark:bg-white/10 dark:text-white",
  containerClassName = "max-w-[min(34rem,88%)] sm:max-w-[min(34rem,70%)]",
}) {
  const isMine = message.is_mine;
  const authorId = message.author_id ?? message.sender_id;
  const authorColorKey = message.author_color ?? message.sender_color;
  const [showMenu, setShowMenu] = useState(false);
  const [menuClick, setMenuClick] = useState({ x: 0, y: 0 });
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showHeartTrigger, setShowHeartTrigger] = useState(false);
  const [pickerExpanded, setPickerExpanded] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const rootRef = useRef(null);
  const bubbleRef = useRef(null);
  const menuRef = useRef(null);
  const pickerRef = useRef(null);
  const hoverOpenTimerRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);
  const suppressHoverUntilLeaveRef = useRef(false);
  const pointerInsideRef = useRef(false);
  const longPressTimerRef = useRef(null);

  const bubbleClass = isMine ? mineClassName : otherClassName;
  const canReact = typeof onReact === "function";
  const hasContextMenuActions =
    canReact ||
    (isMine && onEdit) ||
    (isMine && onDelete) ||
    onPin ||
    (!isMine && onReport) ||
    (!isMine && onMute);
  const reactionBadgeClass =
    "inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-[#2b3344] px-1.5 py-0.5 text-xs font-bold text-white shadow-lg ring-1 ring-black/10";

  const clearHoverTimers = useCallback(() => {
    if (hoverOpenTimerRef.current) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  const updatePickerPosition = useCallback(() => {
    if (!bubbleRef.current) {
      return;
    }
    setPickerPosition(
      getReactionPickerPosition(
        bubbleRef.current.getBoundingClientRect(),
        isMine,
        pickerExpanded
      )
    );
  }, [isMine, pickerExpanded]);

  function closeMenu() {
    setShowMenu(false);
  }

  function closeReactionUi() {
    setShowHeartTrigger(false);
    setPickerExpanded(false);
  }

  function openMenuAt(clientX, clientY) {
    clearHoverTimers();
    closeReactionUi();
    setMenuClick({ x: clientX, y: clientY });
    setMenuPosition(
      clampContextMenuPosition(
        clientX,
        clientY,
        MENU_ESTIMATE.width,
        MENU_ESTIMATE.height
      )
    );
    setShowMenu(true);
  }

  function handleMessageContextMenu(event) {
    if (!hasContextMenuActions) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    openMenuAt(event.clientX, event.clientY);
  }

  function handleMessageKeyDown(event) {
    if (!hasContextMenuActions) {
      return;
    }
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      openMenuAt(
        bubbleRef.current?.getBoundingClientRect().left ?? 0,
        bubbleRef.current?.getBoundingClientRect().top ?? 0
      );
    }
  }

  function handleTouchStart(event) {
    if (!hasContextMenuActions) {
      return;
    }
    if (event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      openMenuAt(touch.clientX, touch.clientY);
    }, 450);
  }

  function handleTouchEnd() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleTouchMove() {
    handleTouchEnd();
  }

  function scheduleHeartTrigger() {
    if (!canReact || showMenu || suppressHoverUntilLeaveRef.current) {
      return;
    }
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    if (hoverOpenTimerRef.current || showHeartTrigger) {
      return;
    }
    hoverOpenTimerRef.current = window.setTimeout(() => {
      hoverOpenTimerRef.current = null;
      if (!pointerInsideRef.current || suppressHoverUntilLeaveRef.current) {
        return;
      }
      updatePickerPosition();
      setShowHeartTrigger(true);
    }, HOVER_HEART_DELAY_MS);
  }

  function scheduleHideReactionUi() {
    if (hoverOpenTimerRef.current) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
    }
    const delay =
      showHeartTrigger || pickerExpanded ? HOVER_LEAVE_WITH_PICKER_MS : HOVER_LEAVE_DELAY_MS;
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      const overArticle = rootRef.current?.matches(":hover");
      const overPicker = pickerRef.current?.matches(":hover");
      if (overArticle || overPicker) {
        return;
      }
      closeReactionUi();
    }, delay);
  }

  function handleArticleMouseEnter() {
    pointerInsideRef.current = true;
    scheduleHeartTrigger();
  }

  function handleArticleMouseLeave() {
    pointerInsideRef.current = false;
    suppressHoverUntilLeaveRef.current = false;
    scheduleHideReactionUi();
  }

  function keepReactionUiVisible() {
    pointerInsideRef.current = true;
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }

  function handlePickerExpand() {
    setPickerExpanded(true);
    updatePickerPosition();
    keepReactionUiVisible();
  }

  function handlePickerCollapse() {
    setPickerExpanded(false);
    updatePickerPosition();
  }

  function handleReactionPick(emoji) {
    if (!canReact) {
      return;
    }
    clearHoverTimers();
    closeReactionUi();
    suppressHoverUntilLeaveRef.current = true;
    pointerInsideRef.current = false;
    onReact(message, emoji);
  }

  useLayoutEffect(() => {
    if (!showMenu || !menuRef.current) {
      return;
    }
    const rect = menuRef.current.getBoundingClientRect();
    setMenuPosition(clampContextMenuPosition(menuClick.x, menuClick.y, rect.width, rect.height));
  }, [showMenu, menuClick.x, menuClick.y]);

  useEffect(() => {
    if (!showHeartTrigger) {
      return undefined;
    }
    updatePickerPosition();
    function handleReposition() {
      updatePickerPosition();
    }
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [showHeartTrigger, pickerExpanded, updatePickerPosition]);

  useEffect(() => {
    if (!showMenu) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (menuRef.current?.contains(event.target)) {
        return;
      }
      closeMenu();
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  useEffect(() => () => {
    clearHoverTimers();
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }
  }, [clearHoverTimers]);

  const hasReactions = message.reactions?.length > 0;
  const displayName = message.author || message.sender_name;
  const authorAvatarUrl = message.author_avatar_url || message.sender_avatar_url;
  const authorPrefetch = {
    display_name: displayName,
    avatar_url: authorAvatarUrl,
  };
  const reactionCornerClass = isMine
    ? "bottom-0 left-1 -translate-x-1 translate-y-1/2"
    : "bottom-0 right-1 translate-x-1 translate-y-1/2";

  const contextMenuPortal =
    showMenu &&
    createPortal(
      <div ref={menuRef} className="fixed z-[200]" style={{ left: menuPosition.x, top: menuPosition.y }}>
        <ChatMessageContextMenu
          message={message}
          isMine={isMine}
          isReacting={isReacting}
          isPinned={isPinned}
          onReact={onReact}
          onPin={onPin}
          onUnpin={onUnpin}
          onReport={onReport}
          onMute={onMute}
          isMuted={isAuthorMuted}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={closeMenu}
        />
      </div>,
      document.body
    );

  const reactionPickerPortal =
    canReact &&
    showHeartTrigger &&
    !showMenu &&
    createPortal(
      <div
        ref={pickerRef}
        role="toolbar"
        aria-label="Xabar reaksiyalari"
        className="fixed z-[190] p-2"
        style={{ top: pickerPosition.top, left: pickerPosition.left }}
        onMouseEnter={keepReactionUiVisible}
        onMouseLeave={scheduleHideReactionUi}
      >
        <ChatReactionPicker
          message={message}
          isReacting={isReacting}
          expanded={pickerExpanded}
          onExpand={handlePickerExpand}
          onCollapse={handlePickerCollapse}
          onPick={handleReactionPick}
        />
      </div>,
      document.body
    );

  return (
    <>
      <article
        ref={rootRef}
        className={`group relative w-full ${hasReactions ? "mb-5" : showHeartTrigger && canReact ? "mb-2" : ""}`}
        onMouseEnter={canReact ? handleArticleMouseEnter : undefined}
        onMouseLeave={canReact ? handleArticleMouseLeave : undefined}
      >
        <div className={`flex w-full gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
          {!isMine && showAuthorAvatar && displayName ? (
            <div className="w-9 shrink-0 self-end pb-0.5">
              {onAuthorClick && authorId ? (
                <button
                  type="button"
                  onClick={() => onAuthorClick(authorId, authorPrefetch)}
                  className="rounded-full transition hover:opacity-90"
                  aria-label={`${displayName} profili`}
                >
                  <UserAvatarWithPresence
                    name={displayName}
                    avatarUrl={authorAvatarUrl}
                    size="sm"
                    colorKey={message.author_color ?? message.sender_color}
                    userId={authorId}
                    isOnline={message.author_is_online}
                    lastSeenAt={message.author_last_seen_at}
                    showPresence
                  />
                </button>
              ) : (
                <UserAvatarWithPresence
                  name={displayName}
                  avatarUrl={authorAvatarUrl}
                  size="sm"
                  colorKey={message.author_color ?? message.sender_color}
                  userId={authorId}
                  isOnline={message.author_is_online}
                  lastSeenAt={message.author_last_seen_at}
                  showPresence
                />
              )}
            </div>
          ) : null}
          <div
            ref={bubbleRef}
            role="group"
            tabIndex={hasContextMenuActions ? 0 : undefined}
            aria-label={hasContextMenuActions ? "Xabar menyusi" : undefined}
            className={`relative w-fit ${containerClassName}`}
            onContextMenu={handleMessageContextMenu}
            onKeyDown={handleMessageKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className={`relative px-3 py-2 shadow-sm ${bubbleClass} ${
                isMine ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"
              } ${isPinned ? "ring-2 ring-amber-300/80 dark:ring-amber-400/50" : ""} ${
                showHeartTrigger && canReact ? "ring-2 ring-white/20" : ""
              }`}
            >
              {!isMine && displayName && (
                onAuthorClick && authorId ? (
                  <ChatAuthorName
                    as="button"
                    type="button"
                    name={displayName}
                    userId={authorId}
                    colorKey={authorColorKey}
                    onClick={() => onAuthorClick(authorId, authorPrefetch)}
                    className="block text-left text-xs transition hover:underline"
                  />
                ) : (
                  <ChatAuthorName
                    as="p"
                    name={displayName}
                    userId={authorId}
                    colorKey={authorColorKey}
                    className="text-xs"
                  />
                )
              )}
              <p
                className={`break-words [overflow-wrap:anywhere] whitespace-pre-wrap text-[15px] leading-snug select-text ${
                  !isMine && displayName ? "mt-0.5" : ""
                }`}
              >
                <ChatMessageText text={message.text} onTagClick={onTagClick} />
              </p>
              <time
                className={`mt-1 block text-[10px] font-semibold opacity-60 ${
                  isMine ? "text-right" : "text-left"
                }`}
              >
                {formatTime(message.created_at)}
                {message.is_edited && (
                  <span className="ml-1.5 opacity-80">· tahrirlangan</span>
                )}
              </time>
            </div>

            {hasReactions && (
              <div className={`absolute z-10 flex flex-wrap gap-1 ${reactionCornerClass}`}>
                {message.reactions.map((reaction) =>
                  canReact ? (
                    <button
                      key={reaction.emoji}
                      type="button"
                      disabled={isReacting}
                      onClick={() => handleReactionPick(reaction.emoji)}
                      className={`${reactionBadgeClass} transition hover:scale-105 disabled:opacity-50 ${
                        reaction.reacted_by_me ? "ring-2 ring-primary/60" : ""
                      }`}
                    >
                      <span className="text-base leading-none">{reaction.emoji}</span>
                      {reaction.count > 1 && (
                        <span className="tabular-nums text-[10px] opacity-90">{reaction.count}</span>
                      )}
                    </button>
                  ) : (
                    <span
                      key={reaction.emoji}
                      className={`${reactionBadgeClass} cursor-default`}
                      aria-label={`${reaction.emoji} reaksiyasi`}
                    >
                      <span className="text-base leading-none">{reaction.emoji}</span>
                      {reaction.count > 1 && (
                        <span className="tabular-nums text-[10px] opacity-90">{reaction.count}</span>
                      )}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </article>

      {contextMenuPortal}
      {reactionPickerPortal}
    </>
  );
}
