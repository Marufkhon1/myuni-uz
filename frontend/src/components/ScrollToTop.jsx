import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Yangi sahifaga o'tganda yuqoridan boshlash (bosh sahifa hash bundan mustasno). */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname === "/" && hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

export function scrollPageToTop(behavior = "auto") {
  window.scrollTo({ top: 0, left: 0, behavior });
}
