import { useEffect, useState } from "react";
import { getUniversityImageUrl, getUniversityBrandGradient } from "@/utils/universityImage.js";

const sizeClasses = {
  "2xs": "h-6 w-6 text-[9px]",
  xs: "h-9 w-9 text-[11px]",
  sm: "h-12 w-12 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-2xl",
};

const frameClasses = {
  "2xs": "border border-white ring-1 ring-white/80 dark:border-white/20 dark:ring-slate-900/50",
  xs: "border-2 border-white ring-2 ring-white/80 dark:border-white/20 dark:ring-slate-900/50",
  sm: "border-2 border-white ring-2 ring-white/80 dark:border-white/20 dark:ring-slate-900/50",
  md: "border-2 border-white ring-2 ring-white/80 dark:border-white/20 dark:ring-slate-900/50",
  lg: "border-2 border-white ring-2 ring-white/80 dark:border-white/20 dark:ring-slate-900/50",
  xl: "border-2 border-white ring-2 ring-white/80 dark:border-white/20 dark:ring-slate-900/50",
};

export default function UniversityAvatar({ university, size = "md" }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const frameClass = frameClasses[size] || frameClasses.md;
  const initials = (university?.short_name || university?.name || "U").slice(0, 2).toUpperCase();
  const primaryUrl = getUniversityImageUrl(university);
  const [imageUrl, setImageUrl] = useState(primaryUrl);
  const [failed, setFailed] = useState(!primaryUrl);

  useEffect(() => {
    const nextUrl = getUniversityImageUrl(university);
    setImageUrl(nextUrl);
    setFailed(!nextUrl);
  }, [university]);

  if (!failed && imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        role="presentation"
        className={`${sizeClass} shrink-0 rounded-full object-cover object-center shadow-sm ${frameClass}`}
        loading="lazy"
        onError={() => {
          setFailed(true);
          setImageUrl(null);
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center rounded-full font-black text-white shadow-sm dark:border-white/15 ${frameClass}`}
      style={{ background: getUniversityBrandGradient(university) }}
    >
      {initials}
    </div>
  );
}
