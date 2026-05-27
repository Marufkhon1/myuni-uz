export function formatUniversityMetaHeader(university) {
  if (!university) {
    return "";
  }

  const parts = [];
  if (university.institution_type) {
    parts.push(university.institution_type);
  }
  if (university.founded_year) {
    parts.push(`${university.founded_year}-yilda tashkil etilgan`);
  }

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  return "";
}

export function formatUniversityPreview(university) {
  if (!university) {
    return "";
  }

  if (university.summary) {
    return university.summary;
  }

  const header = formatUniversityMetaHeader(university);
  return header || university.description || "";
}

/** @deprecated use formatUniversityPreview or formatUniversityMetaHeader */
export function formatUniversityMeta(university) {
  return formatUniversityPreview(university);
}

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
