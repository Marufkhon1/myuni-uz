import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_LOCALE,
  localizePath,
  resolveLocaleFromPath,
  stripLocalePrefix,
} from "@/i18n/config.js";
import { translate } from "@/i18n/messages.js";

/**
 * Active locale from URL prefix (/ru/…). Default uz has no prefix.
 */
export function useLocale() {
  const { pathname } = useLocation();
  const locale = useMemo(() => resolveLocaleFromPath(pathname), [pathname]);

  const t = useMemo(
    () => (key, fallback) => translate(locale.code, key, fallback),
    [locale.code]
  );

  const toLocalized = useMemo(
    () => (path) => localizePath(path, locale.code),
    [locale.code]
  );

  const barePath = useMemo(() => stripLocalePrefix(pathname), [pathname]);

  return {
    locale,
    localeCode: locale.code,
    defaultLocale: DEFAULT_LOCALE,
    t,
    toLocalized,
    barePath,
  };
}
