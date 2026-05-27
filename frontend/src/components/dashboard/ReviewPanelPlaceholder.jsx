import UniversityAvatar from "../UniversityAvatar.jsx";

export default function ReviewPanelPlaceholder({ title, description, iconUniversity, className = "" }) {
  return (
    <div
      className={`flex min-h-[min(420px,calc(100dvh-14rem))] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 px-8 py-12 text-center dark:border-white/15 dark:bg-white/[0.03] ${className}`}
    >
      <div className="opacity-90">
        <UniversityAvatar university={iconUniversity || { short_name: "?" }} size="xl" />
      </div>
      <h3 className="mt-6 max-w-sm text-xl font-black leading-snug text-slate-950 dark:text-white sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
