import { useMemo, useState } from "react";
import {
  isLongUniversitySummary,
  splitSummaryParagraphs,
  truncateUniversitySummary,
} from "@/utils/universityPublic.js";

const bodyClass =
  "text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px] sm:leading-8";

/**
 * Universitet sahifasi: avval qisqa preview, «To'liq o'qish» bilan to'liq matn.
 * Landing kartalarida esa faqat qisqa matn + «Batafsil» linki ishlatiladi.
 */
export default function UniversityPublicSummary({ summary }) {
  const paragraphs = splitSummaryParagraphs(summary);
  const [expanded, setExpanded] = useState(false);

  const fullText = useMemo(() => paragraphs.join(" "), [paragraphs]);
  const preview = useMemo(
    () => truncateUniversitySummary(fullText, { maxSentences: 1, maxLength: 220 }),
    [fullText]
  );
  const isLong = isLongUniversitySummary(summary);

  if (!paragraphs.length) {
    return null;
  }

  return (
    <section
      id="about"
      className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6"
      aria-labelledby="university-about-heading"
    >
      <p id="university-about-heading" className="text-xs font-black uppercase tracking-wide text-primary">
        Universitet haqida
      </p>

      {expanded || !isLong ? (
        <div className="mt-3 space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={bodyClass}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className={`mt-3 ${bodyClass}`}>{preview}</p>
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 inline-flex items-center gap-1 text-sm font-black text-primary transition hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Kamroq ko'rsatish" : "To'liq o'qish"}
          <span aria-hidden="true">{expanded ? "↑" : "→"}</span>
        </button>
      )}
    </section>
  );
}
