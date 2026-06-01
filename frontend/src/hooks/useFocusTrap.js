import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]:not([disabled])",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    if (typeof element.checkVisibility === "function") {
      return element.checkVisibility();
    }

    const style = window.getComputedStyle(element);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

function getTrapScope(container) {
  return container.querySelector('[role="dialog"]') || container;
}

export default function useFocusTrap(
  isActive,
  containerRef,
  { onEscape, restoreFocus = true, lockScroll = true, initialFocusRef = null } = {}
) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef?.current) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    const container = containerRef.current;

    function focusInitial() {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      const scope = getTrapScope(container);
      const focusables = getFocusableElements(scope);
      if (focusables.length > 0) {
        focusables[0].focus();
        return;
      }

      if (scope instanceof HTMLElement) {
        scope.focus();
      }
    }

    const focusFrame = window.requestAnimationFrame(focusInitial);

    function handleKeyDown(event) {
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const scope = getTrapScope(container);
      const focusables = getFocusableElements(scope);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (lockScroll) {
        document.body.style.overflow = previousOverflow;
      }

      if (restoreFocus && previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef, onEscape, restoreFocus, lockScroll, initialFocusRef]);
}
