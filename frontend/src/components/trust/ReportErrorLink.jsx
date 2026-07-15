import { Link, useLocation } from "react-router-dom";

/**
 * «Xato haqida xabar» — current path bilan /xato-xabar ga.
 */
export default function ReportErrorLink({ pagePath, className = "" }) {
  const { pathname } = useLocation();
  const target = pagePath || pathname || "/";
  const to = {
    pathname: "/xato-xabar",
    search: `?url=${encodeURIComponent(target)}`,
  };

  return (
    <Link
      to={to}
      className={
        "inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-slate-600 underline-offset-2 transition hover:text-primary hover:underline dark:text-slate-300 dark:hover:text-blue-200 " +
        className
      }
    >
      Xato haqida xabar
      <span aria-hidden="true">→</span>
    </Link>
  );
}
