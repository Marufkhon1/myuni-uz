export default function UnreadBadge({ count, size = "md", emphasize = false }) {
  if (!count || count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);
  const sizeClass =
    size === "sm"
      ? "h-5 min-w-5 px-1 text-[10px]"
      : "h-6 min-w-6 px-1.5 text-xs";

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-black text-white ${sizeClass} ${
        emphasize
          ? "bg-primary shadow-sm shadow-primary/25"
          : "bg-red-500"
      }`}
      data-testid="unread-badge"
      data-unread-count={count}
    >
      {label}
    </span>
  );
}
