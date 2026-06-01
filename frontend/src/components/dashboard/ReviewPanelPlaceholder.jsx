import EmptyState from "../ui/EmptyState.jsx";

export default function ReviewPanelPlaceholder({ title, description, className = "" }) {
  return (
    <div
      className={`flex min-h-[min(440px,calc(100dvh-14rem))] flex-col items-center justify-center rounded-[1.25rem] bg-gradient-to-b from-slate-50 to-white p-8 ring-1 ring-dashed ring-slate-300/70 dark:from-white/[0.02] dark:to-transparent dark:ring-white/15 ${className}`}
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-3xl">🏛️</div>
      <EmptyState
        variant="university"
        title={title}
        description={description}
        className="border-none bg-transparent p-0 shadow-none dark:bg-transparent"
      />
    </div>
  );
}
