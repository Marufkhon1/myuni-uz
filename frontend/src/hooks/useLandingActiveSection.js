import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  normalizeNavHash,
  resolveActiveSectionFromScroll,
} from "../utils/landingNav.js";

export { normalizeNavHash } from "../utils/landingNav.js";

/**
 * Bosh sahifada URL hash va scroll bo'yicha aktiv menyu bo'limi.
 * Scroll-spy scroll pozitsiyasiga qarab ishlaydi (tepa↔past ikkala yo'nalish).
 */
export function useLandingActiveSection(sectionIds) {
  const { pathname, hash } = useLocation();
  const [activeHash, setActiveHash] = useState(() => normalizeNavHash(hash));
  const lockUntilRef = useRef(0);

  useEffect(() => {
    setActiveHash(normalizeNavHash(hash));
  }, [hash]);

  useEffect(() => {
    if (pathname !== "/") {
      return undefined;
    }

    let frameId = 0;

    function updateFromScroll() {
      if (Date.now() < lockUntilRef.current) {
        return;
      }
      const next = resolveActiveSectionFromScroll(sectionIds);
      setActiveHash((current) => (current === next ? current : next));
    }

    function onScrollOrResize() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateFromScroll);
    }

    onScrollOrResize();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const delayed = window.setTimeout(onScrollOrResize, 400);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(delayed);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [pathname, sectionIds]);

  function setActiveSection(targetHash, { lockMs = 900 } = {}) {
    const normalized = normalizeNavHash(targetHash);
    setActiveHash(normalized);
    if (lockMs > 0) {
      lockUntilRef.current = Date.now() + lockMs;
    }
  }

  return {
    activeHash: pathname === "/" ? activeHash : null,
    setActiveSection,
  };
}
