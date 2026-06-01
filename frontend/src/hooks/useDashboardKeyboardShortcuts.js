import { useEffect } from "react";

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useDashboardKeyboardShortcuts({ enabled = true, onFocusChatComposer }) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function onKeyDown(event) {
      const key = event.key.toLowerCase();
      const usesMeta = event.ctrlKey || event.metaKey;

      if (key === "/" && !usesMeta && !event.altKey) {
        if (isEditableTarget(event.target)) {
          return;
        }
        event.preventDefault();
        onFocusChatComposer?.();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onFocusChatComposer]);
}
