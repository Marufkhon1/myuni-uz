import { getPresenceStyle } from "../../utils/userPresence.js";

export default function PresenceBadge({ isOnline, lastSeenAt, size = "sm" }) {
  const style = getPresenceStyle({ isOnline, lastSeenAt });
  if (!style) {
    return null;
  }

  const sizeClass =
    size === "md"
      ? "gap-2 px-2.5 py-1 text-sm"
      : "gap-1.5 px-2 py-0.5 text-[11px]";

  const dotSize = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <span
      className={`mt-1 inline-flex items-center rounded-full font-bold ${sizeClass} ${style.pillClassName}`}
    >
      <span className={`shrink-0 rounded-full ${dotSize} ${style.dotClassName}`} aria-hidden="true" />
      <span>{style.label}</span>
    </span>
  );
}
