import { useState } from "react";
import { getUniversityImageUrl } from "../utils/universityImage.js";

const SIZE = {
  sm: { box: "h-10 w-10 rounded-xl text-xs", text: "text-xs" },
  md: { box: "h-14 w-14 rounded-2xl text-sm", text: "text-sm" },
  lg: { box: "h-16 w-16 rounded-2xl text-base sm:h-[4.5rem] sm:w-[4.5rem] sm:text-lg", text: "text-base" },
};

export default function UniversityIdentity({ university, size = "md", className = "" }) {
  const sizing = SIZE[size] ?? SIZE.md;
  const initials = (university?.short_name || university?.name || "U").slice(0, 2).toUpperCase();
  const primaryUrl = getUniversityImageUrl(university);
  const [imageUrl, setImageUrl] = useState(primaryUrl);
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        role="presentation"
        className={`${sizing.box} shrink-0 object-cover shadow-lg ring-2 ring-white/20 ${className}`}
        loading="lazy"
        onError={() => {
          setFailed(true);
          setImageUrl("");
        }}
      />
    );
  }

  return (
    <div
      className={`${sizing.box} grid shrink-0 place-items-center bg-gradient-to-br from-primary via-blue-600 to-violet-600 font-black text-white shadow-lg ring-2 ring-white/20 ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
