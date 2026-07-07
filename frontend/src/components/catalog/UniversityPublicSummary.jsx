import { useState } from "react";
import { splitSummaryParagraphs } from "@/utils/universityPublic.js";

export default function UniversityPublicSummary({ summary }) {
  const paragraphs = splitSummaryParagraphs(summary);
  const [expanded, setExpanded] = useState(false);

  if (!paragraphs.length) {
    return null;
  }

  const visible = expanded ? paragraphs : paragraphs.slice(0, 2);
  const canExpand = paragraphs.length > 2;

  return (
    <section className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Universitet haqida</p>
      <div className="mt-3 space-y-4">
        {visible.map((paragraph, index) => (
          <p
            key={index}
            className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px] sm:leading-8"
          >
            {paragraph}
          </p>
        ))}
      </div>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 text-sm font-black text-primary hover:underline"
        >
          {expanded ? "Kamroq ko'rsatish" : `To'liq o'qish (${paragraphs.length} paragraf)`}
        </button>
      )}
    </section>
  );
}
