export default function ReviewSectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        )}
        {title && (
          <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
