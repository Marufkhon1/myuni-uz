import { parseHashtagParts, normalizeHashtag } from "@/utils/chatHashtags.js";

export default function ChatMessageText({ text, onTagClick, className = "" }) {
  const parts = parseHashtagParts(text);

  if (!parts.length) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("#")) {
          const tag = normalizeHashtag(part);
          if (onTagClick) {
            return (
              <button
                key={`${tag}-${index}`}
                type="button"
                onClick={() => onTagClick(tag)}
                className="font-bold text-blue-200 underline decoration-blue-200/50 underline-offset-2 transition hover:text-white dark:text-blue-300"
              >
                {part}
              </button>
            );
          }
          return (
            <span key={`${tag}-${index}`} className="font-bold text-blue-200 dark:text-blue-300">
              {part}
            </span>
          );
        }
        return <span key={`text-${index}`}>{part}</span>;
      })}
    </span>
  );
}
