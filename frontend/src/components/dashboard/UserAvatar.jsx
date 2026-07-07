import { resolveMediaUrl } from "@/utils/media.js";
import { getAuthorColorHex, getNameInitials } from "@/utils/chatAuthorColor.js";

const userAvatarSizes = {
  xs: { box: "h-7 w-7", text: "text-[10px]", textPair: "text-[9px]" },
  sm: { box: "h-9 w-9", text: "text-sm", textPair: "text-[10px]" },
  md: { box: "h-12 w-12", text: "text-base", textPair: "text-xs" },
  lg: { box: "h-14 w-14", text: "text-lg", textPair: "text-sm" },
};

export default function UserAvatar({ name, avatarUrl, size = "sm", colorKey, userId }) {
  const sizeConfig = userAvatarSizes[size] || userAvatarSizes.sm;

  const resolvedUrl = resolveMediaUrl(avatarUrl);

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className={`${sizeConfig.box} shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-900`}
      />
    );
  }

  const initials = getNameInitials(name);
  const backgroundColor = getAuthorColorHex(userId, colorKey);
  const textClass = initials.length > 1 ? sizeConfig.textPair : sizeConfig.text;

  return (
    <span
      className={`grid ${sizeConfig.box} shrink-0 place-items-center rounded-full font-black leading-none text-white ring-2 ring-white dark:ring-slate-900 ${textClass}`}
      style={{ backgroundColor }}
      aria-hidden={!name}
    >
      {initials}
    </span>
  );
}
