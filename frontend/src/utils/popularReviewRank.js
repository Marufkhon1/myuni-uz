/** Mashhur sharhlar — 1 oltin, 2 kumush, 3 bronza; 4+ oddiy. */
export function getPopularRankStyles(rank) {
  if (!rank || rank > 3) {
    return null;
  }

  if (rank === 1) {
    return {
      label: "#1 mashhur",
      accentBar:
        "bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-300 dark:to-amber-500",
      badge:
        "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-sm shadow-amber-500/25 dark:from-amber-300 dark:to-amber-400 dark:text-amber-950",
      headerBar:
        "border-amber-200/60 bg-gradient-to-r from-amber-50/95 via-amber-50/50 to-transparent dark:border-amber-400/20 dark:from-amber-400/12 dark:via-amber-400/5",
      card:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-white to-white shadow-[0_8px_32px_-12px_rgba(245,158,11,0.2)] ring-1 ring-amber-100/70 hover:border-amber-300/80 hover:shadow-md dark:border-amber-400/25 dark:from-amber-400/12 dark:via-slate-800/50 dark:to-slate-900/30 dark:ring-amber-400/15",
      quoteBox:
        "border-amber-100/80 bg-white/90 dark:border-amber-400/20 dark:bg-slate-900/40",
    };
  }

  if (rank === 2) {
    return {
      label: "#2 mashhur",
      accentBar:
        "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 dark:from-slate-400 dark:via-slate-500 dark:to-slate-600",
      badge:
        "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 text-slate-800 shadow-sm ring-1 ring-slate-300/70 dark:from-slate-500/50 dark:via-slate-400/40 dark:to-slate-600/50 dark:text-slate-100 dark:ring-slate-400/30",
      headerBar:
        "border-slate-200/90 bg-gradient-to-r from-slate-50/95 via-slate-50/55 to-transparent dark:border-slate-500/25 dark:from-slate-500/12 dark:via-slate-500/5",
      card:
        "border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white to-white shadow-[0_8px_28px_-12px_rgba(100,116,139,0.22)] ring-1 ring-slate-200/80 hover:border-slate-400/70 hover:shadow-md dark:border-slate-500/30 dark:from-slate-600/15 dark:via-slate-800/45 dark:to-slate-900/35 dark:ring-slate-500/15",
      quoteBox:
        "border-slate-200/90 bg-slate-50/75 dark:border-slate-500/25 dark:bg-slate-900/45",
    };
  }

  return {
    label: "#3 mashhur",
    accentBar:
      "bg-gradient-to-b from-amber-600 via-orange-700 to-amber-900 dark:from-amber-500 dark:via-orange-600 dark:to-amber-800",
    badge:
      "bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-amber-50 shadow-sm shadow-orange-900/20 ring-1 ring-amber-600/40 dark:from-amber-600/80 dark:via-orange-700/70 dark:to-amber-900/80 dark:text-amber-50",
    headerBar:
      "border-amber-300/55 bg-gradient-to-r from-orange-50/95 via-amber-50/50 to-transparent dark:border-amber-600/25 dark:from-amber-900/18 dark:via-amber-900/8",
    card:
      "border-amber-400/45 bg-gradient-to-br from-orange-50/90 via-white to-white shadow-[0_8px_28px_-12px_rgba(180,83,9,0.18)] ring-1 ring-amber-200/60 hover:border-amber-500/50 hover:shadow-md dark:border-amber-600/30 dark:from-amber-900/15 dark:via-slate-800/45 dark:to-slate-900/35 dark:ring-amber-700/20",
    quoteBox:
      "border-amber-200/85 bg-orange-50/55 dark:border-amber-600/25 dark:bg-slate-900/45",
  };
}
