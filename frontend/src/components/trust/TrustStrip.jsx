import { Link } from "react-router-dom";
import ReportErrorLink from "./ReportErrorLink.jsx";

/**
 * Trust chrome — last updated, sources, report error.
 * @param {{
 *   updatedLabel?: string,
 *   sources?: Array<{ label: string, href: string }>,
 *   reportPath?: string,
 *   className?: string,
 * }} props
 */
export default function TrustStrip({
  updatedLabel,
  sources = [],
  reportPath,
  className = "",
}) {
  return (
    <aside
      className={
        "rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.04] " +
        className
      }
      aria-label="Ishonch va manbalar"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          {updatedLabel ? (
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Yangilangan: <span className="text-slate-900 dark:text-white">{updatedLabel}</span>
            </p>
          ) : null}
          {sources.length > 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              Manbalar:{" "}
              {sources.map((source, index) => (
                <span key={source.href}>
                  {index > 0 ? (
                    <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                      {" · "}
                    </span>
                  ) : null}
                  <Link
                    to={source.href}
                    className="font-semibold text-primary hover:underline dark:hover:text-blue-200"
                  >
                    {source.label}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
        <ReportErrorLink pagePath={reportPath} />
      </div>
    </aside>
  );
}
