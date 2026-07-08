export function formatLandingStat(value) {
  const count = Number(value) || 0;
  return new Intl.NumberFormat("uz-UZ").format(count);
}

export function formatLandingRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric.toFixed(1);
}

export function buildHeroStats(stats) {
  if (!stats) {
    return null;
  }

  return [
    {
      value: formatLandingStat(stats.university_count),
      label: "Universitet",
    },
    {
      value: formatLandingStat(stats.review_count),
      label: "Sharhlar",
    },
    {
      value: formatLandingStat(stats.member_count),
      label: "Ro'yxatdan o'tgan",
    },
  ];
}

export function buildAboutStats(stats) {
  if (!stats) {
    return [];
  }

  return [
    { value: formatLandingStat(stats.university_count), label: "Universitet" },
    { value: formatLandingStat(stats.review_count), label: "Sharhlar" },
    { value: formatLandingStat(stats.member_count), label: "Ro'yxatdan o'tgan" },
    { value: formatLandingStat(stats.chat_member_count), label: "Chat a'zosi" },
  ];
}

export function buildSocialProofHighlights(stats) {
  if (!stats) {
    return [];
  }

  const highlights = [];

  if (stats.reviews_last_7_days > 0) {
    highlights.push({
      value: formatLandingStat(stats.reviews_last_7_days),
      label: "Oxirgi 7 kunda yangi sharh",
    });
  }

  if (stats.new_members_last_7_days > 0) {
    highlights.push({
      value: formatLandingStat(stats.new_members_last_7_days),
      label: "Oxirgi 7 kunda yangi a'zo",
    });
  }

  if (stats.chat_member_count > 0) {
    highlights.push({
      value: formatLandingStat(stats.chat_member_count),
      label: "Chat a'zosi",
    });
  }

  if (stats.message_count > 0) {
    highlights.push({
      value: formatLandingStat(stats.message_count),
      label: "Chat xabari",
    });
  }

  return highlights;
}

export function excerptReviewText(text, maxLength = 160) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}
