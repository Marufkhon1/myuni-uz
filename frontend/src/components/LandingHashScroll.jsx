import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToLandingSection } from "../utils/landingScroll.js";

/** Bosh sahifada URL hash bo'yicha bo'limga scroll. */
export default function LandingHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== "/" || !hash) {
      return undefined;
    }

    const runScroll = () => scrollToLandingSection(hash);
    runScroll();
    const retry = window.setTimeout(runScroll, 120);

    return () => window.clearTimeout(retry);
  }, [pathname, hash]);

  return null;
}
