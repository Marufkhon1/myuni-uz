const SNIPPET_RADIUS = 36;
const SNIPPET_MAX = 120;

function buildSnippet(text, query) {
  const source = text || "";
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { before: "", match: "", after: source.slice(0, SNIPPET_MAX) };
  }

  const lower = source.toLowerCase();
  const qLower = trimmedQuery.toLowerCase();
  const index = lower.indexOf(qLower);
  if (index < 0) {
    const slice = source.slice(0, SNIPPET_MAX);
    return { before: slice, match: "", after: "" };
  }

  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(source.length, index + trimmedQuery.length + SNIPPET_RADIUS);
  const before = `${start > 0 ? "…" : ""}${source.slice(start, index)}`;
  const match = source.slice(index, index + trimmedQuery.length);
  const after = `${source.slice(index + trimmedQuery.length, end)}${end < source.length ? "…" : ""}`;

  return { before, match, after };
}

export default function SearchMatchSnippet({ text, query, className = "" }) {
  const { before, match, after } = buildSnippet(text, query);

  return (
    <p className={`line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400 ${className}`}>
      {before}
      {match ? <mark className="rounded bg-blue-100 px-0.5 font-semibold text-primary dark:bg-blue-500/25">{match}</mark> : null}
      {after}
    </p>
  );
}
