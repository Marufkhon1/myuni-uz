import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveLocaleFromPath } from "@/i18n/config.js";

/**
 * Keeps <html lang> / dir in sync with Phase 4 locale architecture.
 */
export default function DocumentLocaleSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    const locale = resolveLocaleFromPath(pathname);
    document.documentElement.lang = locale.htmlLang;
    document.documentElement.dir = locale.dir;
  }, [pathname]);

  return null;
}
