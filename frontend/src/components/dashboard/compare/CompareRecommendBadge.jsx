function TrophyIcon({ className = "h-3.5 w-3.5 shrink-0" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M11 2h2v2h2.5a1 1 0 01.96 1.275l-.72 2.52A4.5 4.5 0 0114.5 12H9.5a4.5 4.5 0 01-1.24-4.205l-.72-2.52A1 1 0 018.5 4H11V2zm-3.2 9.5A6.5 6.5 0 0012 18a6.5 6.5 0 004.2-6.5H7.8zM8 19h8v2H8v-2z" />
    </svg>
  );
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-black uppercase tracking-wide";

const PRESETS = {
  pill: `${BASE} bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[10px] text-amber-950 shadow-sm`,
  ribbon: `${BASE} bg-amber-950/10 px-3 py-1 text-[10px] text-amber-950 dark:bg-white/10 dark:text-amber-300`,
  matrix: `${BASE} px-2.5 py-0.5 text-[9px]`,
};

export default function CompareRecommendBadge({ variant = "pill", className = "", label = "Tavsiya" }) {
  const preset = PRESETS[variant] ?? PRESETS.pill;
  return (
    <span className={className ? `${preset} ${className}` : preset}>
      <TrophyIcon className={variant === "matrix" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
      {label}
    </span>
  );
}

export { TrophyIcon };
