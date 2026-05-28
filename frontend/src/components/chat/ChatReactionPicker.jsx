import { useState } from "react";
import { CHAT_REACTIONS } from "../../constants/chatReactions.js";

const HEART_EMOJI = "❤️";

export default function ChatReactionPicker({
  message,
  isReacting,
  expanded,
  onExpand,
  onCollapse,
  onPick,
}) {
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const isOpen = expanded || hoverExpanded;
  const otherReactions = CHAT_REACTIONS.filter((emoji) => emoji !== HEART_EMOJI);

  function handleHeartEnter() {
    setHoverExpanded(true);
    onExpand?.();
  }

  function handleHeartLeave() {
    setHoverExpanded(false);
    onCollapse?.();
  }

  function handlePick(emoji) {
    setHoverExpanded(false);
    onPick(emoji);
  }

  return (
    <div
      className="flex flex-col items-center"
      onMouseLeave={handleHeartLeave}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {isOpen && (
        <div
          className="mb-0.5 flex flex-col items-center gap-0.5 rounded-full bg-[#2b3344]/95 px-1 py-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm"
          role="toolbar"
          aria-label="Reaksiyalar"
        >
          {otherReactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              disabled={isReacting}
              onClick={() => handlePick(emoji)}
              className={`grid h-9 w-9 place-items-center rounded-full text-xl transition hover:scale-110 hover:bg-white/10 disabled:opacity-50 ${
                message.my_reaction === emoji ? "bg-white/15" : ""
              }`}
              aria-label={`Reaksiya ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={isReacting}
        onMouseEnter={handleHeartEnter}
        onClick={() => handlePick(HEART_EMOJI)}
        className={`grid h-10 w-10 place-items-center rounded-full bg-[#2b3344]/95 text-xl shadow-2xl ring-1 ring-white/10 backdrop-blur-sm transition hover:scale-110 hover:bg-white/10 disabled:opacity-50 ${
          message.my_reaction === HEART_EMOJI ? "ring-2 ring-primary/60" : ""
        } ${isOpen ? "bg-white/10" : ""}`}
        aria-label="Reaksiya — yurak"
      >
        {HEART_EMOJI}
      </button>
    </div>
  );
}
