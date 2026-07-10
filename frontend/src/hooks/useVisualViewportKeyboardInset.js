import { useEffect, useState } from "react";
import {
  KEYBOARD_INSET_CSS_VAR,
  computeKeyboardInset,
  isKeyboardOpenFromInset,
} from "@/utils/visualViewportKeyboard.js";

function readInset() {
  if (typeof window === "undefined") {
    return 0;
  }
  const vv = window.visualViewport;
  if (!vv) {
    return 0;
  }
  return computeKeyboardInset(window.innerHeight, vv.height, vv.offsetTop);
}

function applyInsetCssVar(insetPx, enabled) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  if (!enabled) {
    root.style.removeProperty(KEYBOARD_INSET_CSS_VAR);
    root.removeAttribute("data-myuni-keyboard-open");
    return;
  }
  root.style.setProperty(KEYBOARD_INSET_CSS_VAR, `${insetPx}px`);
  root.setAttribute("data-myuni-keyboard-open", isKeyboardOpenFromInset(insetPx) ? "true" : "false");
}

/**
 * Tracks soft-keyboard overlap via visualViewport.
 * Set `syncDocumentCssVar` only from one owner (DashboardLayout) so cleanup
 * does not clear the inset while another subscriber is still active.
 */
export function useVisualViewportKeyboardInset(enabled = true, { syncDocumentCssVar = false } = {}) {
  const [keyboardInsetPx, setKeyboardInsetPx] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      if (syncDocumentCssVar) {
        applyInsetCssVar(0, false);
      }
      setKeyboardInsetPx(0);
      return undefined;
    }

    let frame = 0;

    const publish = () => {
      const next = readInset();
      setKeyboardInsetPx((current) => (current === next ? current : next));
      if (syncDocumentCssVar) {
        applyInsetCssVar(next, true);
      }

      if (next > 0 && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const schedule = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        publish();
      });
    };

    publish();

    const vv = window.visualViewport;
    window.addEventListener("resize", schedule);
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", schedule);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      if (syncDocumentCssVar) {
        applyInsetCssVar(0, false);
      }
    };
  }, [enabled, syncDocumentCssVar]);

  return {
    keyboardInsetPx,
    isKeyboardOpen: isKeyboardOpenFromInset(keyboardInsetPx),
  };
}
