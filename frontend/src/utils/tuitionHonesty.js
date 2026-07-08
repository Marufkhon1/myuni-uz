/** Tuition honesty — map API tuition_honesty / contract_pricing into UI-safe copy. */

import { formatUzsAmount } from "./universityCatalog.js";

const KIND_FALLBACK = {
  national_estimate: {
    badgeLabel: "Taxmin (davlat bazasi)",
    tone: "amber",
  },
  estimate: {
    badgeLabel: "Taxminiy",
    tone: "amber",
  },
  published_catalog: {
    badgeLabel: "Katalog",
    tone: "emerald",
  },
  unavailable: {
    badgeLabel: "Mavjud emas",
    tone: "slate",
  },
};

/**
 * @param {object|null|undefined} detail
 * @returns {{
 *   available: boolean,
 *   academicYear: string,
 *   currency: string,
 *   disclaimerKind: string,
 *   sourceLabel: string,
 *   badgeLabel: string,
 *   note: string,
 *   forms: { code: string, label: string, averageLabel: string, rangeLabel: string|null }[],
 *   honestyFooter: string,
 *   methodologyHref: string,
 * }}
 */
export function resolveTuitionHonestyDisplay(detail) {
  const honesty = detail?.tuition_honesty;
  const pricing = detail?.contract_pricing;
  const payload =
    honesty && typeof honesty === "object"
      ? honesty
      : {
          available: Boolean(pricing?.forms?.length),
          academic_year: pricing?.academic_year,
          currency: pricing?.currency || "UZS",
          disclaimer_kind: "estimate",
          source_label: "",
          badge_label: "Taxminiy",
          note: pricing?.note || "",
          forms: pricing?.forms || [],
        };

  const kind = payload.disclaimer_kind || (payload.available ? "estimate" : "unavailable");
  const kindMeta = KIND_FALLBACK[kind] || KIND_FALLBACK.estimate;
  const academicYear = payload.academic_year || "2025/2026";
  const forms = (payload.forms || [])
    .filter((form) => form?.average_uzs)
    .map((form) => {
      const min = form.min_uzs;
      const max = form.max_uzs;
      const rangeLabel =
        min != null && max != null && min !== max
          ? `${formatUzsAmount(min)} – ${formatUzsAmount(max)}`
          : null;
      return {
        code: form.code,
        label: form.label || form.code,
        averageLabel: formatUzsAmount(form.average_uzs) || "—",
        rangeLabel,
      };
    });

  const available = Boolean(payload.available && forms.length);
  const note =
    payload.note ||
    (available
      ? "Bu summalar MyUni.uz hisob-kitobi; rasmiy universitet narx-nomasi emas."
      : KIND_FALLBACK.unavailable.badgeLabel);

  const sourceLabel = payload.source_label || kindMeta.badgeLabel;
  const badgeLabel = payload.badge_label || kindMeta.badgeLabel;
  const sourceUrl = (payload.source_url || "").trim() || null;
  const publishedAt = (payload.published_at || "").trim() || null;
  const catalogReference = (payload.catalog_reference || "").trim() || null;

  return {
    available,
    academicYear,
    currency: payload.currency || "UZS",
    disclaimerKind: kind,
    sourceLabel,
    badgeLabel,
    note,
    forms,
    tone: kindMeta.tone,
    sourceUrl,
    publishedAt,
    catalogReference,
    honestyFooter: available
      ? `${badgeLabel}: ${note} Aniq narxni muassasa yoki kontrakt.edu.uz dan tekshiring.`
      : note,
    methodologyHref: "/metodologiya#kontrakt-narxlari",
  };
}
