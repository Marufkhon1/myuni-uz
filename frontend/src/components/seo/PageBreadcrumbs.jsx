import { Link } from "react-router-dom";

/**
 * Ko'rinadigan breadcrumbs — schema bilan birga (JSON-LD alohida sahifada).
 * @param {{ items: Array<{ name: string, path?: string }> }} props
 */
export default function PageBreadcrumbs({ items = [] }) {
  if (!Array.isArray(items) || items.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                  /
                </span>
              ) : null}
              {isLast || !item.path ? (
                <span
                  className="text-slate-800 dark:text-slate-200"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.name}
                </span>
              ) : (
                <Link to={item.path} className="transition hover:text-primary dark:hover:text-blue-200">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
