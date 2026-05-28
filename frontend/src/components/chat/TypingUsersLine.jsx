import { getAuthorColorClass } from "../../utils/chatAuthorColor.js";

function normalizeUser(entry) {
  if (typeof entry === "string") {
    return { id: null, name: entry, color: null };
  }
  return {
    id: entry?.id ?? null,
    name: entry?.name ?? "",
    color: entry?.color ?? null,
  };
}

export default function TypingUsersLine({ users, className = "" }) {
  if (!users?.length) {
    return null;
  }

  const normalized = users.map(normalizeUser).filter((item) => item.name);

  return (
    <p className={className}>
      {normalized.map((item, index) => (
        <span key={item.id ?? `${item.name}-${index}`}>
          {index > 0 ? ", " : null}
          <span
            className={
              item.id
                ? `font-bold ${getAuthorColorClass(item.id, item.color)}`
                : "font-semibold"
            }
          >
            {item.name}
          </span>
        </span>
      ))}{" "}
      yozmoqda...
    </p>
  );
}
