import { getAuthorColorHex } from "@/utils/chatAuthorColor.js";

export default function ChatAuthorName({
  name,
  userId,
  colorKey,
  as: Tag = "span",
  className = "",
  style,
  ...props
}) {
  if (!name) {
    return null;
  }

  return (
    <Tag
      className={`font-bold tracking-wide ${className}`}
      style={{ color: getAuthorColorHex(userId, colorKey), ...style }}
      {...props}
    >
      {name}
    </Tag>
  );
}
