import { useState } from "react";
import {
  CAMPUS_IMAGE_PATHS,
  campusIndex,
  getUniversityBannerUrl,
} from "../utils/universityImage.js";

export default function UniversityCampusBanner({ university, className = "h-48" }) {
  const primaryUrl = getUniversityBannerUrl(university);
  const fallbackUrl = CAMPUS_IMAGE_PATHS[campusIndex(university)];
  const [imageUrl, setImageUrl] = useState(primaryUrl);

  if (!imageUrl) {
    return (
      <div
        className={`${className} w-full bg-gradient-to-br from-primary/80 to-violet-600/90`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`relative ${className} w-full overflow-hidden`}>
      <img
        src={imageUrl}
        alt=""
        role="presentation"
        className="h-full w-full object-cover object-center"
        loading="lazy"
        onError={() => {
          if (imageUrl !== fallbackUrl) {
            setImageUrl(fallbackUrl);
          }
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
