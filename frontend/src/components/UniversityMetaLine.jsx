import { formatUniversityMetaHeader } from "../utils/universityMetaFormat.js";

export default function UniversityMetaLine({ university, className = "" }) {
  const header = formatUniversityMetaHeader(university);
  const summary = university?.summary;

  if (!header && !summary) {
    return null;
  }

  return (
    <div className={className}>
      {header && (
        <p className="text-sm font-semibold text-primary dark:text-blue-300">{header}</p>
      )}
      {summary && (
        <p className={`text-sm leading-7 text-slate-600 dark:text-slate-300 ${header ? "mt-2" : ""}`}>
          {summary}
        </p>
      )}
    </div>
  );
}
