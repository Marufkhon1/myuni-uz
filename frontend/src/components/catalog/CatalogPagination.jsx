import { Link } from "react-router-dom";

/**
 * Crawlable catalog pagination — numbered links + SEO next/prev via parent meta.
 */
export default function CatalogPagination({
  page = 1,
  totalPages = 1,
  buildPageHref,
  className = "",
}) {
  if (totalPages <= 1) {
    return null;
  }

  const current = Math.min(Math.max(1, page), totalPages);
  const windowStart = Math.max(1, current - 2);
  const windowEnd = Math.min(totalPages, current + 2);
  const pages = [];
  for (let value = windowStart; value <= windowEnd; value += 1) {
    pages.push(value);
  }

  return (
    <nav
      aria-label="Katalog sahifalari"
      className={"mt-10 flex flex-wrap items-center justify-center gap-2 " + className}
    >
      {current > 1 ? (
        <Link
          to={buildPageHref(current - 1)}
          rel="prev"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-primary/40 dark:border-white/10 dark:text-slate-200"
        >
          Oldingi
        </Link>
      ) : null}

      {windowStart > 1 ? (
        <>
          <Link
            to={buildPageHref(1)}
            className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:text-primary"
          >
            1
          </Link>
          {windowStart > 2 ? <span className="text-slate-400">…</span> : null}
        </>
      ) : null}

      {pages.map((value) => (
        <Link
          key={value}
          to={buildPageHref(value)}
          aria-current={value === current ? "page" : undefined}
          className={
            value === current
              ? "rounded-full bg-primary px-3.5 py-2 text-sm font-black text-white"
              : "rounded-full px-3.5 py-2 text-sm font-bold text-slate-600 hover:text-primary dark:text-slate-300"
          }
        >
          {value}
        </Link>
      ))}

      {windowEnd < totalPages ? (
        <>
          {windowEnd < totalPages - 1 ? <span className="text-slate-400">…</span> : null}
          <Link
            to={buildPageHref(totalPages)}
            className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:text-primary"
          >
            {totalPages}
          </Link>
        </>
      ) : null}

      {current < totalPages ? (
        <Link
          to={buildPageHref(current + 1)}
          rel="next"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-primary/40 dark:border-white/10 dark:text-slate-200"
        >
          Keyingi
        </Link>
      ) : null}
    </nav>
  );
}

export const CATALOG_PAGE_SIZE = 24;

export function buildCatalogPageHref(page, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value != null && key !== "page") {
      params.set(key, String(value));
    }
  });
  if (page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `/universitetlar?${query}` : "/universitetlar";
}
