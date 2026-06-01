import { useEffect, useRef } from "react";
import { ensurePushSubscription } from "../services/pushService.js";

export function useWebPush({ enabled = false } = {}) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!enabled || attemptedRef.current) {
      return undefined;
    }
    attemptedRef.current = true;

    let cancelled = false;

    ensurePushSubscription()
      .then((result) => {
        if (!cancelled && !result.ok && result.reason !== "denied" && result.reason !== "unsupported") {
          console.debug("Web push not active:", result.reason);
        }
      })
      .catch(() => {
        /* push optional */
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
