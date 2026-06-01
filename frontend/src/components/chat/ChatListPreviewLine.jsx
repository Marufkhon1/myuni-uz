import AnimatedTypingDots from "./AnimatedTypingDots.jsx";
import { useChatListPreviewRotation } from "../../hooks/useChatListPreviewRotation.js";
import { getAuthorColorClass } from "../../utils/chatAuthorColor.js";

export default function ChatListPreviewLine({ typingUsers, messagePreview, className = "" }) {
  const { phase, currentTyper, hasTypers } = useChatListPreviewRotation({ typingUsers });

  if (phase === "typing" && hasTypers && currentTyper) {
    return (
      <p
        className={`flex items-center truncate text-sm font-medium text-primary ${className}`.trim()}
        aria-live="polite"
      >
        <span
          className={`truncate font-bold ${getAuthorColorClass(currentTyper.id, currentTyper.color)}`}
        >
          {currentTyper.name}
        </span>
        <span className="ml-1 shrink-0">
          yozmoqda
          <AnimatedTypingDots className="text-primary/85" />
        </span>
      </p>
    );
  }

  return (
    <p
      className={`truncate text-sm font-medium text-slate-500 dark:text-slate-400 ${className}`.trim()}
    >
      {messagePreview}
    </p>
  );
}
