export function formatPrivateTypingText() {
  return "Yozmoqda";
}

export function estimateTypingMaxChars(containerWidth) {
  if (!containerWidth || containerWidth <= 0) {
    return 48;
  }
  return Math.max(24, Math.floor(containerWidth / 7.5));
}

/**
 * Guruh chatida ismlarni sig'guncha qoldiradi, qolganlari "va yana N kishi".
 */
export function formatGroupTypingDisplay(users, maxChars = 60) {
  const normalized = (users || [])
    .map((entry) => {
      if (typeof entry === "string") {
        return { id: null, name: entry, color: null };
      }
      return {
        id: entry?.id ?? null,
        name: entry?.name ?? "",
        color: entry?.color ?? null,
      };
    })
    .filter((item) => item.name);

  if (!normalized.length) {
    return { visible: [], hiddenCount: 0, useFallback: false };
  }

  const suffix = " yozmoqda";
  const hiddenSuffix = (count) => ` va yana ${count} kishi`;

  for (let visibleCount = normalized.length; visibleCount >= 1; visibleCount -= 1) {
    const hiddenCount = normalized.length - visibleCount;
    const visible = normalized.slice(0, visibleCount);
    const plainText =
      visible.map((item) => item.name).join(", ") +
      (hiddenCount > 0 ? hiddenSuffix(hiddenCount) : "") +
      suffix;

    if (plainText.length <= maxChars || visibleCount === 1) {
      return { visible, hiddenCount, useFallback: false };
    }
  }

  return { visible: [], hiddenCount: normalized.length, useFallback: true };
}
