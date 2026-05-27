import { useEffect, useRef, useState } from "react";
import { CHAT_REACTIONS } from "../../constants/chatReactions.js";

const REACTION_TRIGGER_DELAY_MS = 1500;
const REACTION_HIDE_DELAY_MS = 220;

export default function ChatMessageBubble({
  message,
  formatTime,
  onReact,
  onAuthorClick,
  isReacting = false,
  mineClassName = "bg-primary text-white",
  otherClassName = "bg-white text-slate-900 dark:bg-white/10 dark:text-white",
  containerClassName = "max-w-[min(42rem,78%)]",
}) {
  const isMine = message.is_mine;
  const [showHeartTrigger, setShowHeartTrigger] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const rootRef = useRef(null);
  const triggerTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const bubbleClass = isMine ? mineClassName : otherClassName;
  const reactionChipClass = isMine
    ? "border-white/20 bg-white/95 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
    : "border-slate-200/90 bg-white text-slate-800 shadow-sm dark:border-white/15 dark:bg-slate-800 dark:text-white";

  /** Telegram: o‘z xabari — tanlov chat markaziga (chap), boshqasi — o‘ngga */
  const pickerAnchorClass = isMine
    ? "right-full bottom-1 mr-0.5"
    : "left-full bottom-1 ml-0.5";

  const heartAnchorClass = isMine
    ? "bottom-0.5 -left-2"
    : "bottom-0.5 -right-2";

  function clearTriggerTimer() {
    if (triggerTimerRef.current) {
      window.clearTimeout(triggerTimerRef.current);
      triggerTimerRef.current = null;
    }
  }

  function clearHideTimer() {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function scheduleHeartTrigger() {
    clearTriggerTimer();
    clearHideTimer();
    triggerTimerRef.current = window.setTimeout(() => {
      setShowHeartTrigger(true);
      triggerTimerRef.current = null;
    }, REACTION_TRIGGER_DELAY_MS);
  }

  function scheduleHideReactionUi() {
    clearTriggerTimer();
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setShowHeartTrigger(false);
      setShowPicker(false);
      hideTimerRef.current = null;
    }, REACTION_HIDE_DELAY_MS);
  }

  function cancelHideReactionUi() {
    clearHideTimer();
  }

  function openReactionPicker(event) {
    event.stopPropagation();
    setShowPicker(true);
    setShowHeartTrigger(false);
    clearTriggerTimer();
    clearHideTimer();
  }

  function handleReactionClick(emoji) {
    onReact(message, emoji);
    setShowPicker(false);
    setShowHeartTrigger(false);
  }

  function handleTouchStart() {
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      setShowHeartTrigger(true);
      longPressTimerRef.current = null;
    }, REACTION_TRIGGER_DELAY_MS);
  }

  function handleTouchEnd() {
    clearLongPressTimer();
  }

  useEffect(() => {
    if (!showPicker) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setShowPicker(false);
        setShowHeartTrigger(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showPicker]);

  useEffect(
    () => () => {
      clearTriggerTimer();
      clearHideTimer();
      clearLongPressTimer();
    },
    []
  );

  const hasReactions = message.reactions?.length > 0;

  return (
    <article
      ref={rootRef}
      className={`group/msg relative w-fit ${containerClassName} ${isMine ? "ml-auto" : "mr-auto"} ${
        hasReactions ? "mb-4" : showHeartTrigger || showPicker ? "mb-1" : ""
      }`}
      onMouseEnter={scheduleHeartTrigger}
      onMouseLeave={scheduleHideReactionUi}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="relative" onMouseEnter={cancelHideReactionUi}>
        <div
          className={`relative px-3 py-2 shadow-sm ${bubbleClass} ${
            isMine ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"
          }`}
        >
          {!isMine && (message.author || message.sender_name) && (
            onAuthorClick && (message.author_id || message.sender_id) ? (
              <button
                type="button"
                onClick={() =>
                  onAuthorClick(message.author_id ?? message.sender_id, {
                    display_name: message.author || message.sender_name,
                  })
                }
                className="text-left text-[11px] font-bold uppercase tracking-wide text-primary/90 transition hover:text-primary"
              >
                {message.author || message.sender_name}
              </button>
            ) : (
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary/90">
                {message.author || message.sender_name}
              </p>
            )
          )}
          <p
            className={`text-[15px] leading-snug ${
              !isMine && (message.author || message.sender_name) ? "mt-0.5" : ""
            }`}
          >
            {message.text}
          </p>
          <time
            className={`mt-1 block text-[10px] font-semibold opacity-60 ${
              isMine ? "text-right" : "text-left"
            }`}
          >
            {formatTime(message.created_at)}
          </time>
        </div>

        {showHeartTrigger && !showPicker && !isReacting && (
          <button
            type="button"
            title="Reaksiya"
            onClick={openReactionPicker}
            className={`absolute z-10 grid h-6 w-6 place-items-center rounded-full bg-[#3a3a3a] text-xs text-white shadow-md transition hover:scale-105 ${heartAnchorClass}`}
            aria-label="Reaksiyalar"
          >
            ❤️
          </button>
        )}

        {showPicker && (
          <div
            className={`absolute z-30 ${pickerAnchorClass} ${isReacting ? "pointer-events-none opacity-60" : ""}`}
            onMouseEnter={cancelHideReactionUi}
            onMouseLeave={scheduleHideReactionUi}
          >
            <div
              className="flex items-center gap-0 rounded-full bg-[#383838]/95 px-0.5 py-0.5 shadow-lg backdrop-blur-sm"
              role="toolbar"
              aria-label="Reaksiyalar"
            >
              {CHAT_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={isReacting}
                  onClick={() => handleReactionClick(emoji)}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-base leading-none transition hover:scale-110 hover:bg-white/10 disabled:cursor-not-allowed ${
                    message.my_reaction === emoji ? "bg-white/15" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasReactions && (
        <div
          className={`absolute -bottom-3 z-10 flex flex-wrap gap-1 ${isMine ? "right-2" : "left-2"}`}
        >
          {message.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              type="button"
              disabled={isReacting}
              onClick={() => onReact(message, reaction.emoji)}
              className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs font-bold transition disabled:opacity-50 ${reactionChipClass} ${
                reaction.reacted_by_me ? "ring-1 ring-primary/50" : ""
              }`}
            >
              <span className="text-sm leading-none">{reaction.emoji}</span>
              <span className="tabular-nums">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
