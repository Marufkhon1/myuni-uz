import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const variantClasses = {
  gradient: "bg-gradient-to-r from-blue-500 via-primary to-cyan-500 bg-clip-text text-transparent",
  light: "bg-gradient-to-r from-white via-cyan-100 to-sky-200 bg-clip-text text-transparent",
};

export default function HeroRotatingText({
  words,
  intervalMs = 2800,
  className = "",
  variant = "gradient",
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const toneClass = variantClasses[variant] ?? variantClasses.gradient;
  const longestWord = words.reduce((longest, word) => (word.length > longest.length ? word : longest), words[0]);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, reduceMotion, words.length]);

  const currentWord = words[index] ?? words[0];

  if (reduceMotion || words.length <= 1) {
    return <span className={toneClass + " " + className}>{currentWord}</span>;
  }

  return (
    <span className={"inline-grid overflow-visible align-baseline " + className}>
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {longestWord}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentWord}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className={"col-start-1 row-start-1 whitespace-nowrap will-change-transform " + toneClass}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
