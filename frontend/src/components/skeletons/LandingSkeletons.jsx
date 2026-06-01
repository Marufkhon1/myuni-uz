import Skeleton from "../ui/Skeleton.jsx";

function LandingUniversityCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      <Skeleton className="h-52 rounded-none sm:h-56" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-4 h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/10">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function LandingUniversitiesSkeleton() {
  return (
    <div
      className="mt-12 grid gap-6 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Universitetlar yuklanmoqda"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <LandingUniversityCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function LandingReviewsSkeleton() {
  return (
    <div
      className="mt-10 grid gap-6 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Sharhlar yuklanmoqda"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="mt-4 h-20 w-full" />
          <Skeleton className="mt-3 h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
