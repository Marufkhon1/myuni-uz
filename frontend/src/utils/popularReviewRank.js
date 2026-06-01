export function getPopularRankStyles(rank) {
  if (rank === 1) {
    return {
      label: "#1 mashhur",
      badge:
        "bg-amber-100 text-amber-900 ring-1 ring-amber-200/90 dark:bg-amber-400/20 dark:text-amber-100 dark:ring-amber-400/30",
      card:
        "border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/50 shadow-soft ring-1 ring-amber-100/60 hover:border-amber-300/90 hover:shadow-md dark:border-amber-400/25 dark:from-amber-400/12 dark:via-white/[0.05] dark:to-yellow-400/8 dark:ring-amber-400/10 dark:hover:border-amber-400/40",
    };
  }

  if (rank === 2) {
    return {
      label: "#2 mashhur",
      badge:
        "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 ring-1 ring-slate-300/90 dark:from-white/20 dark:to-white/10 dark:text-slate-100 dark:ring-white/20",
      card:
        "border-slate-300/80 bg-gradient-to-br from-slate-100/75 via-white to-slate-50/60 shadow-sm ring-1 ring-slate-200/60 hover:border-slate-400/90 hover:shadow-md dark:border-white/15 dark:from-white/10 dark:via-white/[0.04] dark:to-slate-400/8 dark:ring-white/10 dark:hover:border-white/25",
    };
  }

  if (rank === 3) {
    return {
      label: "#3 mashhur",
      badge:
        "bg-orange-100 text-orange-900 ring-1 ring-orange-200/90 dark:bg-orange-400/15 dark:text-orange-100 dark:ring-orange-400/25",
      card:
        "border-orange-200/80 bg-gradient-to-br from-orange-50/75 via-white to-amber-50/45 shadow-sm ring-1 ring-orange-100/60 hover:border-orange-300/90 hover:shadow-md dark:border-orange-400/20 dark:from-orange-400/10 dark:via-white/[0.05] dark:to-amber-400/8 dark:ring-orange-400/10 dark:hover:border-orange-400/35",
    };
  }

  return {
    label: `#${rank} mashhur`,
    badge:
      "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10",
    card: "border-slate-200/80 bg-white shadow-sm hover:border-slate-300/90 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/20",
  };
}
