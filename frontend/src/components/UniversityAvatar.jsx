import { useState } from "react";
import { CAMPUS_IMAGE_PATHS, campusIndex, getUniversityImageUrl } from "../utils/universityImage.js";

const sizeClasses = {
  sm: "h-12 w-12 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-2xl",
};

export default function UniversityAvatar({ university, size = "md" }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initials = (university?.short_name || university?.name || "U").slice(0, 2).toUpperCase();
  const primaryUrl = getUniversityImageUrl(university);
  const fallbackUrl = CAMPUS_IMAGE_PATHS[campusIndex(university)];
  const [imageUrl, setImageUrl] = useState(primaryUrl);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        role="presentation"
        className={`${sizeClass} shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-white/80 dark:border-white/20 dark:ring-slate-900/50`}
        loading="lazy"
        onError={() => {
          if (imageUrl !== fallbackUrl) {
            setImageUrl(fallbackUrl);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center rounded-full border-2 border-slate-200 bg-gradient-to-br from-primary to-violet-500 font-black text-white shadow-sm dark:border-white/15`}
    >
      {initials}
    </div>
  );
}
