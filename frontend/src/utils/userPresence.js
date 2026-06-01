const ONLINE_MS = 3 * 60 * 1000;

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatClockTime(date) {
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(date) {
  return date.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
  });
}

export function formatUserPresence({ isOnline, lastSeenAt, now = new Date() } = {}) {
  if (isOnline) {
    return { label: "Hozir online", isOnline: true };
  }

  if (!lastSeenAt) {
    return { label: "Hali tizimga kirmagan", isOnline: false };
  }

  const seenAt = new Date(lastSeenAt);
  if (Number.isNaN(seenAt.getTime())) {
    return { label: "Hali tizimga kirmagan", isOnline: false };
  }

  const diffMs = now.getTime() - seenAt.getTime();
  if (diffMs < ONLINE_MS) {
    return { label: "Hozir online", isOnline: true };
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) {
    return {
      label: `Oxirgi marta: ${diffMinutes} daqiqa oldin`,
      isOnline: false,
    };
  }

  const today = startOfDay(now);
  const seenDay = startOfDay(seenAt);
  const dayDiff = Math.round((today.getTime() - seenDay.getTime()) / 86400000);

  if (dayDiff === 0) {
    return {
      label: `Oxirgi marta: bugun, ${formatClockTime(seenAt)}`,
      isOnline: false,
    };
  }

  if (dayDiff === 1) {
    return {
      label: `Oxirgi marta: kecha, ${formatClockTime(seenAt)}`,
      isOnline: false,
    };
  }

  if (dayDiff < 7) {
    return {
      label: `Oxirgi marta: ${formatShortDate(seenAt)}, ${formatClockTime(seenAt)}`,
      isOnline: false,
    };
  }

  return {
    label: `Oxirgi marta: ${seenAt.toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    isOnline: false,
  };
}

export function getPresenceStyle({ isOnline, lastSeenAt, now = new Date() } = {}) {
  const presence = formatUserPresence({ isOnline, lastSeenAt, now });
  if (
    !presence ||
    presence.label === "Hali tizimga kirmagan" ||
    presence.label === "Oxirgi faollik: ma'lum emas"
  ) {
    return null;
  }

  if (presence.isOnline) {
    return {
      ...presence,
      dotClassName:
        "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]",
      pillClassName:
        "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30",
    };
  }

  if (!lastSeenAt) {
    return null;
  }

  const seenAt = new Date(lastSeenAt);
  if (Number.isNaN(seenAt.getTime())) {
    return null;
  }

  const diffMinutes = Math.floor((now.getTime() - seenAt.getTime()) / 60000);
  const dayDiff = Math.round(
    (startOfDay(now).getTime() - startOfDay(seenAt).getTime()) / 86400000
  );

  if (diffMinutes < 60) {
    return {
      ...presence,
      dotClassName: "bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.35)]",
      pillClassName:
        "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/80 dark:bg-amber-400/12 dark:text-amber-200 dark:ring-amber-400/25",
    };
  }

  if (dayDiff === 0) {
    return {
      ...presence,
      dotClassName: "bg-sky-500 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]",
      pillClassName:
        "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-400/12 dark:text-sky-200 dark:ring-sky-400/25",
    };
  }

  if (dayDiff === 1) {
    return {
      ...presence,
      dotClassName: "bg-violet-400 shadow-[0_0_0_2px_rgba(167,139,250,0.3)]",
      pillClassName:
        "bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-200/80 dark:bg-violet-400/12 dark:text-violet-200 dark:ring-violet-400/25",
    };
  }

  return {
    ...presence,
    dotClassName: "bg-slate-400 dark:bg-slate-500",
    pillClassName:
      "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/80 dark:bg-white/8 dark:text-slate-300 dark:ring-white/10",
  };
}

/** Avatar burchagi uchun doim rangli nuqta (chat a'zolari ro'yxati). */
export function getPresenceDotStyle({ isOnline, lastSeenAt, now = new Date() } = {}) {
  const style = getPresenceStyle({ isOnline, lastSeenAt, now });
  if (style) {
    return {
      label: style.label,
      isOnline: style.isOnline,
      dotClassName: style.dotClassName,
    };
  }

  return {
    label: "Hali faol emas",
    isOnline: false,
    dotClassName: "bg-slate-300 dark:bg-slate-600",
  };
}
