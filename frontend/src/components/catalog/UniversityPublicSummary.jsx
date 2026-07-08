import { useState } from "react";
import { splitSummaryParagraphs } from "@/utils/universityPublic.js";

export default function UniversityPublicSummary({ summary }) {
  const paragraphs = splitSummaryParagraphs(summary);
  const [expanded, setExpanded] = useState(false);

  if (!paragraphs.length) {
    return null;
  }

  const canCollapse = paragraphs.length > 2;

  return (
    <section
      id="about"
      className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6"
      aria-labelledby="university-about-heading"
    >
      <p id="university-about-heading" className="text-xs font-black uppercase tracking-wide text-primary">
        Universitet haqida
      </p>
      <div className="mt-3 space-y-4">
        {paragraphs.map((paragraph, index) => {
          const isCollapsedTail = canCollapse && !expanded && index >= 2;
          return (
            <p
              key={index}
              className={
                isCollapsedTail
                  ? "sr-only"
                  : "text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px] sm:leading-8"
              }
            >
              {paragraph}
            </p>
          );
        })}
      </div>
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 text-sm font-black text-primary hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Kamroq ko'rsatish" : `To'liq o'qish (${paragraphs.length} paragraf)`}
        </button>
      )}
    </section>
  );
}
