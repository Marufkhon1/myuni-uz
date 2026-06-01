import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { pickActiveTyper, sortTypingQueue } from "../utils/typingQueue.js";

const TYPING_PHASE_MS = 2600;
const MESSAGE_PHASE_MS = 3400;

export function useChatListPreviewRotation({ typingUsers }) {
  const sortedTypers = useMemo(() => sortTypingQueue(typingUsers), [typingUsers]);
  const hasTypers = sortedTypers.length > 0;
  const [phase, setPhase] = useState("message");
  const [queueIndex, setQueueIndex] = useState(0);
  const timerRef = useRef(null);
  const hadTypersRef = useRef(false);

  const { typer: currentTyper } = useMemo(
    () => pickActiveTyper(sortedTypers, queueIndex),
    [sortedTypers, queueIndex]
  );

  useLayoutEffect(() => {
    if (!hasTypers) {
      setQueueIndex(0);
      setPhase("message");
      hadTypersRef.current = false;
      return;
    }

    if (!hadTypersRef.current) {
      setPhase("typing");
    }
    hadTypersRef.current = true;

    setQueueIndex((previous) => pickActiveTyper(sortedTypers, previous).index);
  }, [sortedTypers, hasTypers]);

  useEffect(() => {
    if (!hasTypers) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    let activePhase = "typing";
    setPhase("typing");

    const scheduleNext = () => {
      const delay = activePhase === "typing" ? TYPING_PHASE_MS : MESSAGE_PHASE_MS;
      timerRef.current = window.setTimeout(() => {
        activePhase = activePhase === "typing" ? "message" : "typing";
        setPhase(activePhase);
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasTypers]);

  return {
    phase,
    currentTyper,
    hasTypers,
  };
}
