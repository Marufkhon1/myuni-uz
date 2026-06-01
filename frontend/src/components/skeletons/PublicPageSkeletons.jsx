import Skeleton from "../ui/Skeleton.jsx";

export function UniversityPublicPageSkeleton() {
  return (
    <article
      className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
      aria-busy="true"
      aria-label="Universitet sahifasi yuklanmoqda"
    >
      <Skeleton className="h-40 rounded-none sm:h-48" />
      <div className="space-y-4 p-5 sm:p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </article>
  );
}

export function BlogListSkeleton({ className = "" }) {
  return (
    <ul
      className={`mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}
      aria-busy="true"
      aria-label="Maqolalar yuklanmoqda"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li
          key={index}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-full" />
          <Skeleton className="mt-3 h-16 w-full" />
          <Skeleton className="mt-5 h-4 w-20" />
        </li>
      ))}
    </ul>
  );
}

export function BlogArticleSkeleton() {
  return (
    <article
      className="max-w-3xl"
      aria-busy="true"
      aria-label="Maqola yuklanmoqda"
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-4 h-10 w-full" />
      <Skeleton className="mt-4 h-6 w-4/5" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-10 space-y-4 rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.06]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </article>
  );
}

export function NotificationsListSkeleton() {
  return (
    <div className="space-y-0" aria-busy="true" aria-label="Bildirishnomalar yuklanmoqda">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/5"
        >
          <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
