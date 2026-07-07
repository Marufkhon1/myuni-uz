import { useLayoutEffect, useMemo, useRef, useState } from "react";
import AnimatedTypingDots from "./AnimatedTypingDots.jsx";
import { getAuthorColorClass } from "@/utils/chatAuthorColor.js";
import {
  estimateTypingMaxChars,
  formatGroupTypingDisplay,
} from "@/utils/formatTypingText.js";

export default function TypingUsersLine({ users, className = "", mode = "group" }) {
  const containerRef = useRef(null);
  const [maxChars, setMaxChars] = useState(48);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const update = () => {
      setMaxChars(estimateTypingMaxChars(element.clientWidth));
    };

    update();
    const Observer = typeof window !== "undefined" ? window.ResizeObserver : null;
    if (!Observer) {
      return undefined;
    }
    const observer = new Observer(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const display = useMemo(() => {
    if (mode === "private") {
      return null;
    }
    return formatGroupTypingDisplay(users, maxChars);
  }, [users, maxChars, mode]);

  if (!users?.length) {
    return null;
  }

  if (mode === "private") {
    return (
      <p
        ref={containerRef}
        className={`${className} flex items-center truncate text-slate-500 dark:text-slate-400`}
        aria-live="polite"
      >
        <span className="font-semibold text-primary">
          Yozmoqda
          <AnimatedTypingDots className="text-primary/85" />
        </span>
      </p>
    );
  }

  if (!display?.visible.length && !display?.useFallback) {
    return null;
  }

  if (display.useFallback) {
    return (
      <p
        ref={containerRef}
        className={`${className} truncate text-slate-500 dark:text-slate-400`}
        aria-live="polite"
      >
        <span className="font-semibold text-slate-600 dark:text-slate-300">Bir nechta kishi</span>{" "}
        yozmoqda
        <AnimatedTypingDots className="text-slate-400 dark:text-slate-500" />
      </p>
    );
  }

  return (
    <p
      ref={containerRef}
      className={`${className} truncate text-slate-500 dark:text-slate-400`}
      aria-live="polite"
    >
      {display.visible.map((item, index) => (
        <span key={item.id ?? `${item.name}-${index}`}>
          {index > 0 ? ", " : null}
          <span
            className={
              item.id
                ? `font-bold ${getAuthorColorClass(item.id, item.color)}`
                : "font-semibold text-slate-600 dark:text-slate-300"
            }
          >
            {item.name}
          </span>
        </span>
      ))}
      {display.hiddenCount > 0 ? (
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {" "}
          va yana {display.hiddenCount} kishi
        </span>
      ) : null}{" "}
      yozmoqda
      <AnimatedTypingDots className="text-slate-400 dark:text-slate-500" />
    </p>
  );
}
