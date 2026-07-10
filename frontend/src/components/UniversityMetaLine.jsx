import { formatUniversityMetaHeader } from "../utils/universityMetaFormat.js";
import { truncateUniversitySummary } from "../utils/universityPublic.js";

/**
 * @param {object} props
 * @param {object} props.university
 * @param {string} [props.className]
 * @param {boolean} [props.compact] — landing/katalog kartalari: 1 jumla preview
 */
export default function UniversityMetaLine({ university, className = "", compact = false }) {
  const header = formatUniversityMetaHeader(university);
  const summary = university?.summary;
  const summaryText = compact
    ? truncateUniversitySummary(summary, { maxSentences: 1, maxLength: 220 })
    : summary;

  if (!header && !summaryText) {
    return null;
  }

  return (
    <div className={className}>
      {header ? (
        <p className="text-sm font-semibold text-primary dark:text-blue-300">{header}</p>
      ) : null}
      {summaryText ? (
        <p
          className={
            compact
              ? `text-sm leading-6 text-slate-600 dark:text-slate-300 ${header ? "mt-2" : ""}`
              : `text-sm leading-7 text-slate-600 dark:text-slate-300 ${header ? "mt-2" : ""}`
          }
        >
          {summaryText}
        </p>
      ) : null}
    </div>
  );
}
