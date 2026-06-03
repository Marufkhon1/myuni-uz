import Skeleton from "../ui/Skeleton.jsx";
import { mainContentProps } from "../../utils/mainContent.js";

export function DashboardChatSkeleton() {
  return (
    <section
      className="grid gap-4 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:items-stretch md:gap-6"
      aria-busy="true"
      aria-label="Chatlar yuklanmoqda"
    >
      <div className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-5 dark:border-white/10 dark:bg-white/[0.06]">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-8 w-48" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 flex-1 rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-11 w-full rounded-2xl" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden min-h-[420px] flex-col rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] md:flex">
        <div className="border-b border-slate-100 p-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-4">
          <div className="flex justify-start">
            <Skeleton className="h-16 w-[min(18rem,70%)] rounded-2xl rounded-bl-md" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-[min(14rem,55%)] rounded-2xl rounded-br-md" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-20 w-[min(20rem,75%)] rounded-2xl rounded-bl-md" />
          </div>
        </div>
        <div className="border-t border-slate-100 p-4 dark:border-white/10">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

export function DashboardReviewsSkeleton() {
  return (
    <section
      className="mx-auto grid w-full min-w-0 max-w-[1600px] items-start gap-4 md:gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch lg:gap-6"
      aria-busy="true"
      aria-label="Sharhlar yuklanmoqda"
    >
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.06] lg:w-[300px] lg:max-w-[300px] lg:shrink-0">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-40" />
        <Skeleton className="mt-4 h-11 w-full rounded-2xl" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 w-full rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
        <Skeleton className="h-36 rounded-none rounded-t-[2rem] sm:h-40" />
        <div className="space-y-4 p-5 sm:p-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-36 w-full rounded-[1.35rem]" />
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardCompareSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Taqqoslash yuklanmoqda">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <CompareResultsSkeleton columns={2} />
    </div>
  );
}

export function DashboardDefaultSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Ma'lumotlar yuklanmoqda">
      <Skeleton className="h-28 w-full rounded-[2rem]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-[2rem]" />
        <Skeleton className="h-56 rounded-[2rem]" />
      </div>
    </div>
  );
}

export function DashboardPopularSkeleton() {
  return (
    <div
      className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-6"
      aria-busy="true"
      aria-label="Mashhur sharhlar yuklanmoqda"
    >
      <aside className="min-w-0 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-44" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-2xl" />
      </aside>

      <div className="min-w-0 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:p-5">
        <div className="space-y-3 border-b border-slate-100 pb-4 dark:border-white/10">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-56" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-52 rounded-2xl" />
            <Skeleton className="h-9 w-64 rounded-full" />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-[1.35rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Bosh sahifa yuklanmoqda">
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-[2rem]" />
          <Skeleton className="h-72 rounded-[2rem]" />
        </div>
        <Skeleton className="h-[28rem] rounded-[2rem]" />
      </div>
    </div>
  );
}

export default function DashboardSectionSkeleton({ section = "default" }) {
  if (section === "home") {
    return <DashboardHomeSkeleton />;
  }
  if (section === "chats") {
    return <DashboardChatSkeleton />;
  }
  if (section === "reviews") {
    return <DashboardReviewsSkeleton />;
  }
  if (section === "compare") {
    return <DashboardCompareSkeleton />;
  }
  if (section === "popular") {
    return <DashboardPopularSkeleton />;
  }
  if (section === "profile") {
    return <DashboardDefaultSkeleton />;
  }
  return <DashboardDefaultSkeleton />;
}

export function DashboardPageShellSkeleton() {
  return (
    <main {...mainContentProps} className="min-h-screen bg-[#f5f7fb] text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white/90 p-5 lg:block dark:border-white/10 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-[4.5rem] w-full rounded-3xl" />
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 dark:border-white/10">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-2 h-8 w-56 sm:h-10" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
          </header>
          <div className="p-4 sm:p-6 lg:p-8">
            <DashboardDefaultSkeleton />
          </div>
        </section>
      </div>
    </main>
  );
}

export function ReviewPanelSkeleton({ className = "" }) {
  return (
    <div
      className={`grid min-h-[min(420px,calc(100dvh-14rem))] place-items-center rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-white/[0.06] ${className}`}
      aria-busy="true"
      aria-label="Sharh ma'lumoti yuklanmoqda"
    >
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function CompareResultsSkeleton({ columns = 2 }) {
  const colClass = columns >= 3 ? "xl:grid-cols-3" : "lg:grid-cols-2";
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Taqqoslash natijasi yuklanmoqda">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <div className="h-52 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/[0.06]" />
      <div className={`grid gap-4 ${colClass}`}>
        {Array.from({ length: Math.min(columns, 3) }, (_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

export function AuthCheckSkeleton() {
  return (
    <main {...mainContentProps} className="grid min-h-screen place-items-center bg-white dark:bg-slateNight">
      <div
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
        aria-busy="true"
        aria-label="Hisob tekshirilmoqda"
      >
        <Skeleton className="mx-auto h-4 w-20" />
        <Skeleton className="mx-auto mt-4 h-7 w-44" />
        <Skeleton className="mt-6 h-11 w-full rounded-2xl" />
      </div>
    </main>
  );
}
