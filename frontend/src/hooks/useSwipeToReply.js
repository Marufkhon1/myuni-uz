import { useCallback, useRef, useState } from "react";

const ACTIVATE_PX = 10;
const THRESHOLD_PX = 64;
const MAX_PX = 88;

/**
 * Discord/Telegram-style swipe-right-to-reply for touch devices.
 */
export function useSwipeToReply({ enabled = true, onReply } = {}) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef(null);
  const lockedRef = useRef(null);
  const offsetRef = useRef(0);

  const reset = useCallback(() => {
    startRef.current = null;
    lockedRef.current = null;
    offsetRef.current = 0;
    setOffsetX(0);
    setIsDragging(false);
  }, []);

  const onTouchStart = useCallback(
    (event) => {
      if (!enabled || typeof onReply !== "function" || event.touches.length !== 1) {
        return;
      }
      const touch = event.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY };
      lockedRef.current = null;
      offsetRef.current = 0;
      setIsDragging(true);
    },
    [enabled, onReply]
  );

  const onTouchMove = useCallback(
    (event) => {
      if (!enabled || !startRef.current || event.touches.length !== 1) {
        return;
      }
      const touch = event.touches[0];
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;

      if (lockedRef.current === null) {
        if (Math.abs(dx) < ACTIVATE_PX && Math.abs(dy) < ACTIVATE_PX) {
          return;
        }
        lockedRef.current = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
      }

      if (lockedRef.current !== "h") {
        return;
      }

      const next = Math.max(0, Math.min(MAX_PX, dx));
      offsetRef.current = next;
      setOffsetX(next);
      if (next > 0 && event.cancelable) {
        event.preventDefault();
      }
    },
    [enabled]
  );

  const onTouchEnd = useCallback(() => {
    if (!enabled) {
      reset();
      return;
    }
    const shouldReply = offsetRef.current >= THRESHOLD_PX;
    const reply = onReply;
    reset();
    if (shouldReply && typeof reply === "function") {
      reply();
    }
  }, [enabled, onReply, reset]);

  const onTouchCancel = useCallback(() => {
    reset();
  }, [reset]);

  return {
    offsetX,
    isDragging,
    progress: Math.min(1, offsetX / THRESHOLD_PX),
    isArmed: offsetX >= THRESHOLD_PX,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
    },
  };
}
