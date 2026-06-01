export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200/90 dark:bg-white/10 ${className}`}
      {...props}
    />
  );
}
