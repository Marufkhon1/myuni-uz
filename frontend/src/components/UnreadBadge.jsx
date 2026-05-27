export default function UnreadBadge({ count }) {
  if (!count || count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">
      {label}
    </span>
  );
}
