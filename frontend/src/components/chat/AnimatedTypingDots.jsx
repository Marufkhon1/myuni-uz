import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedTypingDots({ className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className={`ml-1 inline-flex items-end gap-[3px] pb-[2px] ${className}`.trim()}
      aria-hidden="true"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="inline-block h-[5px] w-[5px] rounded-full bg-current"
          animate={
            reduceMotion
              ? { opacity: 0.7, y: 0 }
              : { opacity: [0.35, 1, 0.35], y: [0, -4, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.14,
                }
          }
        />
      ))}
    </span>
  );
}
