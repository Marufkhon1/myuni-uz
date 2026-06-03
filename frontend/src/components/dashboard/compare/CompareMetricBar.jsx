export default function CompareMetricBar({ percent, barClassName = "bg-primary", show = true }) {
  if (!show || percent <= 0) {
    return null;
  }

  return (
    <div className="mx-auto mt-2 h-1 w-full max-w-[4.5rem] overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barClassName}`}
        style={{ width: `${Math.max(8, percent)}%` }}
      />
    </div>
  );
}
