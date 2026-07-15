import { Link } from "react-router-dom";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config.js";
import { useLocale } from "@/i18n/useLocale.js";

/**
 * Compact locale switch — uz live, ru hub reserved.
 */
export default function LocaleSwitcher({ className = "" }) {
  const { localeCode, t } = useLocale();

  return (
    <nav aria-label={t("locale.switch")} className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {t("locale.switch")}
      </span>
      {Object.values(LOCALES).map((locale) => {
        const active = locale.code === localeCode;
        const to = locale.code === DEFAULT_LOCALE ? "/" : locale.pathPrefix || "/ru";
        return (
          <Link
            key={locale.code}
            to={to}
            lang={locale.htmlLang}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white dark:bg-white dark:text-slate-900"
                : "rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-primary/40 dark:border-white/10 dark:text-slate-300"
            }
          >
            {locale.code.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
