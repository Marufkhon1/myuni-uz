import { resolveMediaUrl } from "../../utils/media.js";

const userAvatarSizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-14 w-14 text-lg",
};

export default function UserAvatar({ name, avatarUrl, size = "sm" }) {
  const sizeClass = userAvatarSizes[size] || userAvatarSizes.sm;

  const resolvedUrl = resolveMediaUrl(avatarUrl);

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-900`}
      />
    );
  }

  const initial = (name || "?").slice(0, 1).toUpperCase();
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border border-slate-200 bg-gradient-to-br from-primary to-violet-500 font-black text-white dark:border-white/15 ${sizeClass}`}
    >
      {initial}
    </span>
  );
}
