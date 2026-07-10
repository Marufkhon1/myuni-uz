import { formatOwnershipLabel, formatUzsAmount } from "./universityCatalog.js";

export function splitSummaryParagraphs(summary) {
  if (!summary) {
    return [];
  }
  return String(summary)
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Jumlalarga bo'lish — A.I. / R.G. kabi qisqartmalarni buzmaydi.
 */
function splitSummarySentences(text) {
  const sentences = [];
  let start = 0;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch !== "." && ch !== "!" && ch !== "?" && ch !== "…") {
      continue;
    }

    // "A." / "I." — bitta harfli abbreviatura, jumla emas
    if (ch === "." && i > 0 && /[A-Za-zА-Яа-яЁё]/.test(text[i - 1])) {
      const beforeLetter = i >= 2 ? text[i - 2] : " ";
      if (!/[A-Za-zА-Яа-яЁё]/.test(beforeLetter)) {
        continue;
      }
    }

    let next = i + 1;
    while (next < text.length && /\s/.test(text[next])) {
      next += 1;
    }

    const atEnd = next >= text.length;
    const nextStartsSentence = atEnd || /[A-ZА-ЯЁ«"'(0-9]/.test(text[next]);
    if (!nextStartsSentence) {
      continue;
    }

    const piece = text.slice(start, i + 1).trim();
    if (piece) {
      sentences.push(piece);
    }
    start = next;
    i = next - 1;
  }

  const tail = text.slice(start).trim();
  if (tail) {
    sentences.push(tail);
  }
  return sentences;
}

/**
 * Kartalar uchun qisqa preview — odatda 1 jumla.
 * Jumla chegarasida kesadi; juda uzun jumla bo'lsa so'z chegarasida qisqartiradi.
 */
export function truncateUniversitySummary(summary, { maxSentences = 1, maxLength = 220 } = {}) {
  const normalized = String(summary || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const cleaned = splitSummarySentences(normalized);

  if (cleaned.length <= maxSentences && normalized.length <= maxLength) {
    return normalized;
  }

  let preview = cleaned.slice(0, maxSentences).join(" ").trim();
  if (!preview) {
    preview = normalized;
  }

  if (preview.length > maxLength) {
    const sliced = preview.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(" ");
    preview = (lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
  }

  const wasTruncated = preview.length < normalized.length;
  if (!wasTruncated) {
    return preview;
  }

  return /[.!?…]$/.test(preview) ? preview : `${preview}…`;
}

export function isLongUniversitySummary(summary, { charLimit = 160, maxSentences = 1 } = {}) {
  const normalized = String(summary || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return false;
  }
  const preview = truncateUniversitySummary(normalized, {
    maxSentences,
    maxLength: Math.max(charLimit * 2, 220),
  });
  return preview.length < normalized.length || normalized.length > charLimit;
}

export function summarizeDirections(faculties = []) {
  const counts = { bachelor: 0, master: 0, doctorate: 0, total: 0 };
  for (const faculty of faculties) {
    for (const direction of faculty.directions || []) {
      const level = direction.degree_level || "bachelor";
      counts[level] = (counts[level] || 0) + 1;
      counts.total += 1;
    }
  }
  return counts;
}

export function groupFacultiesByDegree(faculties = [], degreeLevel = "all") {
  return faculties
    .map((faculty) => {
      const directions = (faculty.directions || []).filter(
        (direction) => degreeLevel === "all" || direction.degree_level === degreeLevel
      );
      if (!directions.length) {
        return null;
      }
      return { ...faculty, directions };
    })
    .filter(Boolean);
}

export function filterDirections(faculties = [], query = "") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return faculties;
  }
  return faculties
    .map((faculty) => ({
      ...faculty,
      directions: (faculty.directions || []).filter((direction) => {
        const haystack = [
          direction.name,
          direction.dirid,
          ...(direction.exam_subjects || []),
          ...(direction.study_forms || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      }),
    }))
    .filter((faculty) => faculty.directions.length > 0);
}

export function buildUniversityQuickFacts(detail) {
  if (!detail) {
    return [];
  }
  const directionCounts = summarizeDirections(detail.faculties);
  const facts = [];

  const ownership = formatOwnershipLabel(detail);
  if (ownership) {
    facts.push({ label: "Turi", value: ownership });
  }
  if (detail.institution_type) {
    facts.push({ label: "Muassasa", value: detail.institution_type });
  }
  if (detail.city) {
    facts.push({ label: "Shahar", value: detail.city });
  }
  if (detail.founded_year) {
    facts.push({ label: "Asos solingan", value: String(detail.founded_year) });
  }
  if (directionCounts.total > 0) {
    facts.push({ label: "Yo'nalishlar", value: `${directionCounts.total} ta` });
  }
  if (detail.member_count > 0) {
    facts.push({ label: "Chat a'zolari", value: `${detail.member_count} ta` });
  }

  return facts;
}

export function getHeroDirectionNames(studyDirections = [], reviews = []) {
  const allNames = studyDirections.map((item) => item?.name?.trim()).filter(Boolean);
  if (!allNames.length) {
    return [];
  }

  const counts = new Map();
  for (const review of reviews) {
    const name = review?.study_direction_name?.trim();
    if (name) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }
  }

  if (counts.size === 0) {
    return allNames;
  }

  return [...allNames].sort((a, b) => {
    const diff = (counts.get(b) || 0) - (counts.get(a) || 0);
    return diff !== 0 ? diff : a.localeCompare(b, "uz");
  });
}

/** @deprecated use getHeroDirectionNames */
export function pickPopularDirectionNames(studyDirections = [], reviews = [], limit = 5) {
  return getHeroDirectionNames(studyDirections, reviews).slice(0, limit);
}

export function getHeroFacultyItems(faculties = []) {
  return faculties
    .map((faculty) => ({
      name: faculty?.name?.trim() || "",
      count: faculty?.directions?.length ?? 0,
    }))
    .filter((item) => item.name);
}

export function buildHeroHighlightFacts(university, { reviewCount, averageRating } = {}) {
  if (!university) {
    return [];
  }

  const facts = [];
  const pricing = university.contract_pricing;
  const primaryForm =
    pricing?.forms?.find((form) => form.code === "kunduzgi") || pricing?.forms?.[0];
  if (primaryForm?.average_uzs) {
    facts.push({
      label: `Kontrakt — ${primaryForm.label || "Kunduzgi"}`,
      value: formatUzsAmount(primaryForm.average_uzs) || "—",
    });
  }

  const directionCount = university.study_directions?.length ?? 0;
  if (directionCount > 0) {
    facts.push({ label: "Yo'nalishlar", value: `${directionCount} ta` });
  }

  if (averageRating != null) {
    facts.push({ label: "Reyting", value: `${Number(averageRating).toFixed(1)} / 5` });
  } else if (reviewCount > 0) {
    facts.push({ label: "Sharhlar", value: `${reviewCount} ta` });
  }

  if (university.founded_year) {
    facts.push({ label: "Asos solingan", value: `${university.founded_year}-yil` });
  }

  const ownership = formatOwnershipLabel(university);
  if (ownership) {
    facts.push({ label: "Turi", value: ownership });
  }

  if (university.phone) {
    facts.push({
      label: "Telefon",
      value: university.phone,
      href: `tel:${university.phone.replace(/\s/g, "")}`,
    });
  }

  if (university.website) {
    facts.push({
      label: "Veb-sayt",
      value: "Rasmiy sayt",
      href: university.website.startsWith("http")
        ? university.website
        : `https://${university.website.replace(/^\/+/, "")}`,
    });
  }

  return facts;
}

export function buildHeroSidePanel(university, reviews = [], options = {}) {
  const directionNames = getHeroDirectionNames(university?.study_directions, reviews);
  const facultyItems = getHeroFacultyItems(university?.faculties);
  const facts = buildHeroHighlightFacts(university, options);
  const visibleDirections = directionNames.slice(0, 6);
  const hiddenDirectionCount = Math.max(directionNames.length - visibleDirections.length, 0);
  const hasLeftPanel = visibleDirections.length > 0 || facultyItems.length > 0;
  const showFacts = hasLeftPanel;

  return {
    visibleDirections,
    hiddenDirectionCount,
    facultyItems,
    facts: showFacts ? facts : [],
    hasLeftPanel,
  };
}

export const DEGREE_TABS = [
  { id: "all", label: "Hammasi" },
  { id: "bachelor", label: "Bakalavr" },
  { id: "master", label: "Magistr" },
  { id: "doctorate", label: "Doktorantura" },
];
