export default function CompareMetricBar({ percent, barClassName = "bg-primary" }) {
  return (
    <div className="mx-auto mt-1.5 h-1.5 w-full max-w-[5.5rem] overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
