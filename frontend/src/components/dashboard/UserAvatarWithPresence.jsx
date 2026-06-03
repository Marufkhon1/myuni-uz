import { getPresenceDotStyle } from "../../utils/userPresence.js";
import UserAvatar from "./UserAvatar.jsx";

const dotSizes = {
  sm: "h-3 w-3 ring-[2px]",
  md: "h-3.5 w-3.5 ring-[2.5px]",
  lg: "h-4 w-4 ring-[2.5px]",
};

export default function UserAvatarWithPresence({
  name,
  avatarUrl,
  size = "sm",
  colorKey,
  userId,
  isOnline,
  lastSeenAt,
  showPresence = false,
}) {
  const presence = showPresence ? getPresenceDotStyle({ isOnline, lastSeenAt }) : null;

  return (
    <div className="relative shrink-0">
      <UserAvatar name={name} avatarUrl={avatarUrl} size={size} colorKey={colorKey} userId={userId} />
      {presence ? (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white dark:ring-slate-900 ${dotSizes[size] || dotSizes.sm} ${presence.dotClassName}`}
          title={presence.label}
          aria-label={presence.label}
        />
      ) : null}
    </div>
  );
}
