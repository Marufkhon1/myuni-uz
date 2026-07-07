import AnimatedTypingDots from "./AnimatedTypingDots.jsx";
import { formatUserPresence, getPresenceStyle } from "@/utils/userPresence.js";

function presenceTextClass(style, isOnline) {
  if (isOnline) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (!style?.dotClassName) {
    return "text-slate-400 dark:text-slate-500";
  }
  if (style.dotClassName.includes("amber")) {
    return "text-amber-600 dark:text-amber-400";
  }
  if (style.dotClassName.includes("sky")) {
    return "text-sky-600 dark:text-sky-400";
  }
  if (style.dotClassName.includes("violet")) {
    return "text-violet-600 dark:text-violet-400";
  }
  return "text-slate-500 dark:text-slate-400";
}

export default function PrivateChatHeaderStatus({ isTyping = false, isOnline, lastSeenAt }) {
  if (isTyping) {
    return (
      <p className="mt-0.5 flex items-center text-sm font-semibold text-primary" aria-live="polite">
        Yozmoqda
        <AnimatedTypingDots className="text-primary/85" />
      </p>
    );
  }

  const presence = formatUserPresence({ isOnline, lastSeenAt });
  const style = getPresenceStyle({ isOnline, lastSeenAt });
  const textClass = presenceTextClass(style, presence.isOnline);

  return (
    <p className={`mt-0.5 truncate text-sm font-semibold ${textClass}`} aria-live="polite">
      {presence.isOnline ? "Hozir online" : presence.label}
    </p>
  );
}
